import { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import { useWallet } from "../context/WalletContext";
import CredentialCard from "./CredentialCard";
import AddressPill from "./AddressPill";
import {
  getStudentByStudentId,
  getStudentByWallet,
} from "../utils/studentRegistryApi";

function StudentDashboard() {
  const { account, isAdmin } = useWallet();

  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tracks which student's credentials are currently displayed.
  // Defaults to the connected wallet; admins can look up any address.
  const [viewedStudent, setViewedStudent] = useState("");
  const [viewedStudentId, setViewedStudentId] = useState("");
  const [studentInput, setStudentInput] = useState("");

  useEffect(() => {
    if (!account) return;
    setViewedStudent(account);
    setViewedStudentId("");
  }, [account]);

  useEffect(() => {
    if (!viewedStudent) return;
    loadCredentials(viewedStudent);
  }, [viewedStudent]);

  const loadCredentials = async (studentAddress) => {
    setLoading(true);
    setError("");
    try {
      const contract = await getContract();
      const count = await contract.getCredentialCount(studentAddress);
      const records = [];

      for (let i = 0; i < Number(count); i++) {
        const cred = await contract.getCredential(studentAddress, i);
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
      setError(err.reason || err.message || "Failed to load credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async () => {
    const input = studentInput.trim();
    if (!input) return;

    if (/^0x[a-fA-F0-9]{40}$/.test(input)) {
      setViewedStudent(input);
      try {
        const student = await getStudentByWallet(input);
        setViewedStudentId(student.studentId || "");
      } catch {
        setViewedStudentId("");
      }
      return;
    }

    try {
      const student = await getStudentByStudentId(input.toUpperCase());
      setViewedStudent(student.walletAddress);
      setViewedStudentId(student.studentId || input.toUpperCase());
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Student ID not found. Make sure the student is registered before looking them up."
      );
    }
  };

  const handleViewOwn = () => {
    setStudentInput("");
    setViewedStudent(account);
    setViewedStudentId("");
  };

  const handleRevoke = async (studentAddress, index) => {
    try {
      const contract = await getContract();
      const tx = await contract.revokeCredential(studentAddress, index);
      await tx.wait();
      alert("Credential revoked successfully.");
      loadCredentials(studentAddress);
    } catch (err) {
      alert(err.reason || err.message || "Revoke failed.");
    }
  };

  if (!account) {
    return (
      <div className="app-card" style={{ marginTop: 20 }}>
        <p className="muted-text">Connect your wallet above to view your credentials.</p>
      </div>
    );
  }

  return (
    <div className="app-card" style={{ marginTop: 24 }}>
      <h2 className="section-title">My Credentials</h2>

      {isAdmin && (
        <div className="inline-controls" style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Student ID (e.g. CSE2026-001) or wallet address"
            value={studentInput}
            onChange={(e) => setStudentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            className="input-text"
            style={{ marginBottom: 0 }}
            id="admin-student-lookup"
          />
          <button className="btn btn-primary" onClick={handleLookup}>
            🔍 Look Up Student
          </button>
          <button className="btn btn-secondary" onClick={handleViewOwn}>
            View My Own
          </button>
        </div>
      )}

      {viewedStudent && (
        <p className="muted-text" style={{ marginBottom: 12 }}>
          Showing credentials for:{" "}
          {viewedStudentId ? (
            <strong style={{ color: "var(--clr-primary)" }}>{viewedStudentId}</strong>
          ) : null}
          {" "}
          <AddressPill address={viewedStudent} />
        </p>
      )}

      {loading && (
        <div style={{ marginTop: 16 }}>
          <div className="skeleton skeleton-line wide" />
          <div className="skeleton skeleton-line medium" />
          <div className="skeleton skeleton-line narrow" />
        </div>
      )}

      {error && (
        <div className="banner banner-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && credentials.length === 0 && (
        <div className="app-empty-state">
          <p style={{ fontSize: 32, margin: "0 0 8px" }}>🎓</p>
          <p>No credentials have been issued yet.</p>
        </div>
      )}

      {!loading && credentials.length > 0 && (
        <span className="stats-chip">
          {credentials.length} credential{credentials.length !== 1 ? "s" : ""} on file
        </span>
      )}

      {!loading &&
        credentials.map((cred) => (
          <CredentialCard
            key={cred.index}
            credential={cred}
            studentAddress={viewedStudent}
            isAdmin={isAdmin}
            onRevoke={handleRevoke}
          />
        ))}
    </div>
  );
}

export default StudentDashboard;
