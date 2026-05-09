import { useState } from "react";
import { getReadOnlyContract } from "../utils/readOnlyContract";
import { ethers } from "ethers";
import { getStudentByStudentId } from "../utils/studentRegistryApi";

/**
 * Manual verification form.
 * Uses the read-only provider so verifiers without MetaMask can still verify.
 */
function VerifyCredential() {
  const [studentId, setStudentId] = useState("");
  const [cid, setCid] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    setResult("");
    setError("");

    if (!studentId.trim()) {
      setError("Please enter the student ID.");
      return;
    }
    if (!cid.trim()) {
      setError("Please enter the Document ID from the credential.");
      return;
    }

    setLoading(true);
    try {
      const student = await getStudentByStudentId(studentId.trim().toUpperCase());
      const contract = getReadOnlyContract();
      const cidHash = ethers.keccak256(ethers.toUtf8Bytes(cid.trim()));
      const isValid = await contract.verifyCredential(student.walletAddress, cidHash);
      setResult(isValid ? "valid" : "invalid");
    } catch (err) {
      setError(err.reason || err.message || "Verification failed. Please check the details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--clr-text-muted)", display: "block", marginBottom: 4 }}>
        Student ID
      </label>
      <input
        type="text"
        placeholder="e.g. CSE2026-001"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="input-text"
        id="verify-student-id"
      />

      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--clr-text-muted)", display: "block", marginBottom: 4 }}>
        Document ID <span style={{ fontWeight: 400, color: "var(--clr-text-light)" }}>(from the credential PDF)</span>
      </label>
      <input
        type="text"
        placeholder="Paste the Document ID from the credential certificate"
        value={cid}
        onChange={(e) => setCid(e.target.value)}
        className="input-text"
        id="verify-doc-id"
      />

      <button
        className="btn btn-primary"
        onClick={verify}
        disabled={loading}
        id="verify-submit-btn"
      >
        {loading ? "⏳ Verifying…" : "🔍 Verify Credential"}
      </button>

      {result === "valid" && (
        <div className="banner banner-success" style={{ marginTop: 16 }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div>
            <strong>Valid Credential</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13 }}>
              This credential is genuine and has not been revoked.
            </p>
          </div>
        </div>
      )}

      {result === "invalid" && (
        <div className="banner banner-error" style={{ marginTop: 16 }}>
          <span style={{ fontSize: 22 }}>❌</span>
          <div>
            <strong>Invalid or Revoked</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13 }}>
              This credential could not be verified. It may have been revoked or the details
              may not match.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="banner banner-error" style={{ marginTop: 16 }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default VerifyCredential;
