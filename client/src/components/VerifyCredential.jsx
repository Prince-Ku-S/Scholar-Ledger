import { useState } from "react";
import { getReadOnlyContract } from "../utils/readOnlyContract";
import { ethers } from "ethers";
import { getStudentByStudentId } from "../utils/studentRegistryApi";

// Manual verification form. Uses the read-only provider so verifiers
// without MetaMask can still verify credentials.
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
      setError("Please enter the IPFS CID.");
      return;
    }

    setLoading(true);
    try {
      const student = await getStudentByStudentId(studentId.trim().toUpperCase());
      const contract = getReadOnlyContract();
      const cidHash = ethers.keccak256(ethers.toUtf8Bytes(cid.trim()));
      const isValid = await contract.verifyCredential(
        student.walletAddress,
        cidHash
      );
      setResult(
        isValid ? "✅ Valid Credential" : "❌ Invalid or Revoked Credential"
      );
    } catch (err) {
      setError(err.reason || err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Verify Credential</h3>

      <input
        type="text"
        placeholder="Student ID (e.g. CSE2026-001)"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        style={{ display: "block", width: "420px", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="IPFS CID"
        value={cid}
        onChange={(e) => setCid(e.target.value)}
        style={{ display: "block", width: "420px", marginBottom: "10px" }}
      />
      <button onClick={verify} disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </button>

      {result && <p>{result}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default VerifyCredential;
