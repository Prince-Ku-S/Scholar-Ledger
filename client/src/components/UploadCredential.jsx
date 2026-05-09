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

  // Only admins can issue credentials
  if (!isAdmin) return null;

  const handleUploadAndStore = async () => {
    setError("");
    setStatus("");
    setCid("");

    if (!studentId.trim()) {
      setError("Please enter the student ID.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a credential title.");
      return;
    }
    if (!file) {
      setError("Please select the credential document (PDF).");
      return;
    }

    try {
      let walletAddress = "";
      const normalizedStudentId = studentId.trim().toUpperCase();

      try {
        const existingStudent = await getStudentByStudentId(normalizedStudentId);
        walletAddress = existingStudent.walletAddress;
      } catch {
        if (!studentWallet.trim()) {
          throw new Error(
            "This student ID isn't registered yet. Enter their wallet address below to register them first."
          );
        }
        const registered = await upsertStudent({
          studentId: normalizedStudentId,
          walletAddress: studentWallet.trim(),
        });
        walletAddress = registered.walletAddress;
      }

      setStatus("📤 Uploading document to secure storage…");
      const ipfsCid = await uploadToIPFS(file);
      setCid(ipfsCid);

      setStatus("⛓️ Recording credential on the blockchain…");
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
      setError(err.reason || err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="app-card" style={{ marginTop: 24 }}>
      <h3 className="section-title">Issue a New Credential</h3>
      <p className="muted-text" style={{ marginBottom: 16 }}>
        Fill in the student's ID and upload their certificate document. If this is a new
        student, also provide their wallet address to link their account.
      </p>

      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--clr-text-muted)", display: "block", marginBottom: 4 }}>
        Student ID *
      </label>
      <input
        type="text"
        placeholder="e.g. CSE2026-001"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="input-text"
        id="issue-student-id"
      />

      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--clr-text-muted)", display: "block", marginBottom: 4 }}>
        Student Wallet Address{" "}
        <span style={{ fontWeight: 400, color: "var(--clr-text-light)" }}>
          (only needed when registering a new student)
        </span>
      </label>
      <input
        type="text"
        placeholder="0x… (leave blank if student is already registered)"
        value={studentWallet}
        onChange={(e) => setStudentWallet(e.target.value)}
        className="input-text"
        id="issue-student-wallet"
      />

      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--clr-text-muted)", display: "block", marginBottom: 4 }}>
        Credential Title *
      </label>
      <input
        type="text"
        placeholder="e.g. BTech Semester 6 Transcript"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input-text"
        id="issue-cred-title"
      />

      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--clr-text-muted)", display: "block", marginBottom: 6 }}>
        Credential Document (PDF) *
      </label>
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e) => setFile(e.target.files[0])}
        className="input-file"
        id="issue-cred-file"
      />

      <button
        className="btn btn-primary"
        onClick={handleUploadAndStore}
        style={{ marginTop: 6 }}
        id="issue-cred-btn"
      >
        🚀 Issue Credential
      </button>

      {status && (
        <div className="banner banner-success" style={{ marginTop: 14 }}>
          <span>{status}</span>
        </div>
      )}
      {error && (
        <div className="banner banner-error" style={{ marginTop: 14 }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      {cid && (
        <p className="muted-text" style={{ marginTop: 8 }}>
          Document ID: <code style={{ fontSize: 11 }}>{cid}</code>
        </p>
      )}
    </div>
  );
}

export default UploadCredential;
