import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { getReadOnlyContract } from "../utils/readOnlyContract";
import { getStudentByWallet } from "../utils/studentRegistryApi";
import AddressPill from "../components/AddressPill";

/**
 * Public credential verification — no wallet required.
 * Reads the credential at the given (address, index) directly via JsonRpcProvider.
 */
function PublicVerify() {
  const { address, index } = useParams();
  const [studentId, setStudentId] = useState("");
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTech, setShowTech] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const contract = getReadOnlyContract();
        const count = await contract.getCredentialCount(address);
        const total = Number(count);
        const idx = Number(index);

        if (Number.isNaN(idx) || idx < 0 || idx >= total) {
          setError("Credential not found for this student.");
          return;
        }

        const cred = await contract.getCredential(address, idx);
        setCredential({
          index: idx,
          cidHash: cred[0],
          cid: cred[1],
          title: cred[2],
          issuedOn: new Date(Number(cred[3]) * 1000).toLocaleDateString(),
          revoked: cred[4],
          issuer: cred[5],
        });
      } catch (err) {
        setError(err.reason || err.message || "Could not reach the network.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [address, index]);

  useEffect(() => {
    getStudentByWallet(address)
      .then((student) => setStudentId(student.studentId || ""))
      .catch(() => setStudentId(""));
  }, [address]);

  const IPFS_GATEWAY =
    process.env.REACT_APP_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

  if (loading) {
    return (
      <div style={{ maxWidth: 740, margin: "40px auto" }}>
        <div className="app-card">
          <div className="skeleton skeleton-line medium" style={{ marginBottom: 16 }} />
          <div className="skeleton skeleton-line wide" />
          <div className="skeleton skeleton-line narrow" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 640, margin: "60px auto" }}>
        <div className="app-card">
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 48 }}>❌</span>
            <h2 style={{ color: "var(--clr-error)", marginTop: 10 }}>Verification Failed</h2>
          </div>
          <div className="banner banner-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <p className="muted-text" style={{ marginTop: 12 }}>
            Student address: {address} | Index: {index}
          </p>
        </div>
      </div>
    );
  }

  const isValid = credential && !credential.revoked;
  const verifyUrl = window.location.href;
  const ipfsUrl = credential.cid ? `${IPFS_GATEWAY}${credential.cid}` : null;

  return (
    <div className="verify-card">
      {/* ── Header band ───────────────────────────────────── */}
      <div className={`verify-header ${isValid ? "verify-header-valid" : "verify-header-revoked"}`}>
        <span className="verify-emoji">{isValid ? "✅" : "❌"}</span>
        <h1>{isValid ? "Valid Credential" : "Revoked Credential"}</h1>
        <p style={{ margin: "8px 0 0", opacity: 0.88, fontSize: 14 }}>
          {isValid
            ? "This credential is genuine and has not been revoked."
            : "This credential has been revoked by the issuing institution."}
        </p>
      </div>

      {/* ── Credential details ────────────────────────────── */}
      <div className="verify-body">
        <h2 style={{ marginBottom: 18, color: "var(--clr-primary)" }}>
          {credential.title}
        </h2>

        <table style={{ width: "100%", fontSize: 14, lineHeight: 2, borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600, width: 160, verticalAlign: "top", color: "var(--clr-text-muted)", paddingRight: 12 }}>
                Issued To
              </td>
              <td>
                {studentId && (
                  <span style={{ marginRight: 8, fontWeight: 700, color: "var(--clr-primary)" }}>
                    🎓 {studentId}
                  </span>
                )}
                <AddressPill address={address} />
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, verticalAlign: "top", color: "var(--clr-text-muted)", paddingRight: 12 }}>
                Issued On
              </td>
              <td>{credential.issuedOn}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, verticalAlign: "top", color: "var(--clr-text-muted)", paddingRight: 12 }}>
                Issued By
              </td>
              <td><AddressPill address={credential.issuer} /></td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, verticalAlign: "top", color: "var(--clr-text-muted)", paddingRight: 12 }}>
                Status
              </td>
              <td>
                <span className={isValid ? "badge badge-active" : "badge badge-revoked"}>
                  {credential.revoked ? "Revoked" : "Active"}
                </span>
              </td>
            </tr>
            {ipfsUrl && (
              <tr>
                <td style={{ fontWeight: 600, verticalAlign: "top", color: "var(--clr-text-muted)", paddingRight: 12 }}>
                  Document
                </td>
                <td>
                  <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">
                    Open Original Document ↗
                  </a>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Technical details toggle */}
        <button
          className="tech-details-toggle"
          onClick={() => setShowTech((v) => !v)}
          style={{ marginTop: 14 }}
        >
          {showTech ? "▲" : "▼"} {showTech ? "Hide" : "Show"} Technical Details
        </button>

        {showTech && (
          <div className="tech-details">
            <div><strong>Document ID (IPFS CID):</strong><br />{credential.cid}</div>
            <div style={{ marginTop: 6 }}>
              <strong>Verification Fingerprint (CID Hash):</strong><br />{credential.cidHash}
            </div>
            <div style={{ marginTop: 6 }}>
              <strong>Student Wallet:</strong><br />{address}
            </div>
            <div style={{ marginTop: 6 }}>
              <strong>Issuer Wallet:</strong><br />{credential.issuer}
            </div>
          </div>
        )}

        {/* ── QR + share section ────────────────────────────── */}
        <div className="qr-section" style={{ marginTop: 20 }}>
          <div className="qr-frame">
            <QRCodeSVG value={verifyUrl} size={120} level="M" />
            <p style={{ fontSize: 11, color: "var(--clr-text-muted)", marginTop: 6, textAlign: "center" }}>
              Share this QR
            </p>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: "0 0 8px", fontSize: 13 }}>
              <Link
                to={studentId ? `/profile/student/${studentId}` : `/profile/${address}`}
              >
                View student's full credential profile →
              </Link>
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--clr-text-muted)" }}>
              Anyone with this link can independently verify this credential — no account
              or login needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicVerify;
