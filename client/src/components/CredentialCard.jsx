import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { generateCredentialPDF } from "../utils/pdfGenerator";
import AddressPill from "./AddressPill";

const IPFS_GATEWAY =
  process.env.REACT_APP_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

/**
 * CredentialCard — friendly display for a single issued credential.
 * - Plain-language labels (no raw IPFS / blockchain jargon in the main view)
 * - "Technical Details" collapsed section for power-users / verifiers
 * - QR code for share/verify
 * - Buttons: download PDF, copy link, optional revoke (admin only)
 */
function CredentialCard({ credential, studentAddress, isAdmin, onRevoke }) {
  const [copied, setCopied] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showTech, setShowTech] = useState(false);

  const verifyUrl = `${window.location.origin}/verify/${studentAddress}/${credential.index}`;
  const ipfsUrl = credential.cid ? `${IPFS_GATEWAY}${credential.cid}` : null;

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("Copy failed");
      setTimeout(() => setCopied(""), 1800);
    }
  };

  const downloadPDF = async () => {
    setGenerating(true);
    try {
      await generateCredentialPDF({
        studentAddress,
        cidHash: credential.cidHash,
        cid: credential.cid,
        title: credential.title,
        issuedOn: credential.issuedOn,
        revoked: credential.revoked,
        issuer: credential.issuer,
        verifyUrl,
        ipfsUrl,
      });
    } catch (err) {
      alert("PDF generation failed: " + (err.message || "unknown error"));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={`credential-card${credential.revoked ? " is-revoked" : ""}`}>
      {/* ── Left: metadata ──────────────────────────────────────── */}
      <div className="cred-meta">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <h4 style={{ margin: 0 }}>{credential.title}</h4>
          <span className={credential.revoked ? "badge badge-revoked" : "badge badge-active"}>
            {credential.revoked ? "Revoked" : "Active"}
          </span>
        </div>

        <div className="meta-row">
          <strong>Issued On:</strong>
          <span>{credential.issuedOn}</span>
        </div>

        <div className="meta-row">
          <strong>Issued By:</strong>
          <AddressPill address={credential.issuer} />
        </div>

        {credential.cid && ipfsUrl && (
          <div className="meta-row">
            <strong>Document:</strong>
            <a href={ipfsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13 }}>
              Open Original Document ↗
            </a>
          </div>
        )}

        {/* Collapsible technical details */}
        <button
          className="tech-details-toggle"
          onClick={() => setShowTech((v) => !v)}
        >
          {showTech ? "▲" : "▼"} {showTech ? "Hide" : "Show"} Technical Details
        </button>

        {showTech && (
          <div className="tech-details">
            <div><strong>Document ID (IPFS CID):</strong><br />{credential.cid || "—"}</div>
            <div style={{ marginTop: 6 }}>
              <strong>Verification Fingerprint (CID Hash):</strong><br />{credential.cidHash}
            </div>
            <div style={{ marginTop: 6 }}>
              <strong>Issuer Wallet:</strong><br />{credential.issuer}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="cred-actions">
          <button className="btn btn-secondary" onClick={downloadPDF} disabled={generating}>
            {generating ? "⏳ Generating…" : "📄 Download PDF"}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => copyToClipboard(verifyUrl, "verify")}
          >
            {copied === "verify" ? "✓ Copied!" : "🔗 Copy Verification Link"}
          </button>
          {isAdmin && !credential.revoked && (
            <button
              className="btn btn-danger"
              onClick={() => onRevoke(studentAddress, credential.index)}
            >
              Revoke
            </button>
          )}
        </div>
      </div>

      {/* ── Right: QR code ──────────────────────────────────────── */}
      <div className="qr-col">
        <div className="qr-frame">
          <QRCodeSVG value={verifyUrl} size={110} level="M" />
        </div>
        <p style={{ fontSize: 11, color: "var(--clr-text-muted)", marginTop: 6, textAlign: "center" }}>
          Scan to verify
        </p>
      </div>
    </div>
  );
}

export default CredentialCard;
