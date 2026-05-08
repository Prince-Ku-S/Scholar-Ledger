import { useState } from "react";
import { uploadToIPFS } from "../utils/ipfs";
import { getContract } from "../utils/contract";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import {
  getStudentByStudentId,
  upsertStudent,
} from "../utils/studentRegistryApi";

function UploadCredential() {
  const { isAdmin } = useWallet();
  const [studentId, setStudentId] = useState("");
  const [studentWallet, setStudentWallet] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // BUG-19: only admins can see this component
  if (!isAdmin) return null;

  const handleUploadAndStore = async () => {
    setError("");
    setStatus("");
    setCid("");

    // BUG-04: all validation runs before the IPFS upload
    if (!studentId.trim()) {
      setError("Please enter a student ID.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a credential title.");
      return;
    }
    if (!file) {
      setError("Please select a file.");
      return;
    }

    // BUG-05: wrapped in try/catch so every failure surfaces a readable message
    try {
      let walletAddress = "";
      const normalizedStudentId = studentId.trim().toUpperCase();
      try {
        const existingStudent = await getStudentByStudentId(normalizedStudentId);
        walletAddress = existingStudent.walletAddress;
      } catch {
        if (!studentWallet.trim()) {
          throw new Error(
            "Student ID not found in registry. Enter wallet address to register this student first."
          );
        }
        const registered = await upsertStudent({
          studentId: normalizedStudentId,
          walletAddress: studentWallet.trim(),
        });
        walletAddress = registered.walletAddress;
      }

      setStatus("Uploading to IPFS...");
      const ipfsCid = await uploadToIPFS(file);
      setCid(ipfsCid);

      setStatus("Storing credential hash on blockchain...");
      const contract = await getContract();
      const cidHash = ethers.keccak256(ethers.toUtf8Bytes(ipfsCid));

      const tx = await contract.issueCredential(
        walletAddress,
        cidHash,
        ipfsCid,
        title.trim()
      );
      await tx.wait();

      setStatus("✅ Credential issued successfully!");
      setStudentId("");
      setStudentWallet("");
      setTitle("");
      setFile(null);
    } catch (err) {
      setStatus("");
      setError(err.reason || err.message || "Transaction failed.");
    }
  };

  return (
    <div className="app-card" style={{ marginTop: "24px" }}>
      <h3>Issue Credential (Admin Only)</h3>
      <p className="muted-text" style={{ marginBottom: "12px" }}>
        Enter a student ID. If it is a new student, add wallet address once to
        create the registry mapping in MongoDB.
      </p>

      <input
        type="text"
        placeholder="Student ID (e.g. CSE2026-001)"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="input-text"
      />
      <input
        type="text"
        placeholder="Student Wallet Address (required only for first-time mapping)"
        value={studentWallet}
        onChange={(e) => setStudentWallet(e.target.value)}
        className="input-text"
      />
      <input
        type="text"
        placeholder="Credential Title (e.g. BTech Semester 6)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input-text"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="input-file"
      />
      <button className="btn btn-primary" onClick={handleUploadAndStore}>
        Upload & Issue Credential
      </button>

      {cid && <p className="muted-text">IPFS CID: {cid}</p>}
      {status && <p className="success-text">{status}</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default UploadCredential;
