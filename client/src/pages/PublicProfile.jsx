import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { getReadOnlyContract } from "../utils/readOnlyContract";
import {
  getStudentByStudentId,
  getStudentByWallet,
} from "../utils/studentRegistryApi";
import AddressPill from "../components/AddressPill";

/**
 * Public student profile — shows every credential a wallet has been issued.
 * No login, no wallet required. Read-only via JsonRpcProvider.
 */
function PublicProfile() {
  const { address, studentId } = useParams();
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [resolvedStudentId, setResolvedStudentId] = useState("");
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        let wallet = address || "";
        let idLabel = studentId || "";

        if (studentId) {
          const student = await getStudentByStudentId(studentId.toUpperCase());
          wallet = student.walletAddress;
          idLabel = student.studentId;
        } else if (address) {
          try {
            const student = await getStudentByWallet(address);
            idLabel = student.studentId;
          } catch {
            // profile can still load by wallet only
          }
        }

        setResolvedAddress(wallet);
        setResolvedStudentId(idLabel);
        const contract = getReadOnlyContract();
        const count = Number(await contract.getCredentialCount(wallet));
        const records = [];
        for (let i = 0; i < count; i++) {
          const cred = await contract.getCredential(wallet, i);
          records.push({
            index: i,
            cidHash: cred[0],
            cid: cred[1],
            title: cred[2],
            issuedOn: new Date(Number(cred[3]) * 1000).toLocaleDateString(),
            revoked: cred[4],
            issuer: cred[5],
          });
        }
        setCredentials(records);
      } catch (err) {
        setError(err.reason || err.message || "Could not load this profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [address, studentId]);

  const profileUrl = window.location.href;
  const copyProfile = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const active = credentials.filter((c) => !c.revoked);
  const revoked = credentials.filter((c) => c.revoked);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      {/* ── Profile hero ─────────────────────────────────── */}
      <div className="profile-hero">
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1>Academic Credential Profile</h1>

          {resolvedStudentId && (
            <div className="student-id-badge">
              🎓 {resolvedStudentId}
            </div>
          )}

          {resolvedAddress && (
            <div style={{ marginTop: 6 }}>
              <AddressPill address={resolvedAddress} short={false} />
            </div>
          )}

          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="action-btn" onClick={copyProfile}>
              {copied ? "✓ Link Copied!" : "🔗 Copy Profile Link"}
            </button>
          </div>
        </div>

        {/* QR code */}
        <div className="qr-frame">
          <QRCodeSVG value={profileUrl} size={110} level="M" />
        </div>
      </div>

      {/* ── Loading ───────────────────────────────────────── */}
      {loading && (
        <div className="app-card" style={{ marginBottom: 16 }}>
          <div className="skeleton skeleton-line wide" />
          <div className="skeleton skeleton-line medium" />
          <div className="skeleton skeleton-line narrow" />
        </div>
      )}

      {/* ── Error ────────────────────────────────────────── */}
      {error && (
        <div className="banner banner-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── No credentials yet ───────────────────────────── */}
      {!loading && !error && credentials.length === 0 && (
        <div className="app-empty-state app-card">
          <p style={{ fontSize: 32, margin: "0 0 8px" }}>🎓</p>
          <p>No credentials have been issued to this student yet.</p>
        </div>
      )}

      {/* ── Stats + credential list ───────────────────────── */}
      {!loading && !error && credentials.length > 0 && (
        <>
          <div className="stat-grid">
            <div className="stat-box stat-box-active">
              <div className="stat-value">{active.length}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-box stat-box-revoked">
              <div className="stat-value">{revoked.length}</div>
              <div className="stat-label">Revoked</div>
            </div>
            <div className="stat-box stat-box-total">
              <div className="stat-value">{credentials.length}</div>
              <div className="stat-label">Total Issued</div>
            </div>
          </div>

          <h2 style={{ marginBottom: 14 }}>Credentials</h2>
          {credentials.map((cred) => (
            <Link
              key={cred.index}
              to={`/verify/${resolvedAddress}/${cred.index}`}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <div
                className={`credential-card${cred.revoked ? " is-revoked" : ""}`}
                style={{ cursor: "pointer" }}
              >
                <div className="cred-meta" style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <h4 style={{ margin: 0 }}>{cred.title}</h4>
                    <span className={cred.revoked ? "badge badge-revoked" : "badge badge-active"}>
                      {cred.revoked ? "Revoked" : "Active"}
                    </span>
                  </div>
                  <div className="meta-row">
                    <strong>Issued On:</strong>
                    <span>{cred.issuedOn}</span>
                  </div>
                  <div className="meta-row">
                    <strong>Issued By:</strong>
                    <AddressPill address={cred.issuer} />
                  </div>
                </div>
                <div style={{ alignSelf: "center", color: "var(--clr-primary)", fontWeight: 600, fontSize: 13 }}>
                  Click to verify →
                </div>
              </div>
            </Link>
          ))}
        </>
      )}
    </div>
  );
}

export default PublicProfile;
