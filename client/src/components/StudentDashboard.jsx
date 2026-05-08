import { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import { useWallet } from "../context/WalletContext";
import CredentialCard from "./CredentialCard";
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
          "Student ID not found in the registry. Register this student in Issue Credential."
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
      <div className="app-card" style={{ marginTop: "20px" }}>
        <p>Connect your wallet to view credentials.</p>
      </div>
    );
  }

  return (
    <div className="app-card" style={{ marginTop: "24px" }}>
      <h2>Credential Dashboard</h2>

      {isAdmin && (
        <div className="inline-controls">
          <input
            type="text"
            placeholder="Enter student ID or wallet address"
            value={studentInput}
            onChange={(e) => setStudentInput(e.target.value)}
            className="input-text"
          />
          <button className="btn btn-primary" onClick={handleLookup}>
            View Student
          </button>
          <button className="btn btn-secondary" onClick={handleViewOwn}>
            View My Credentials
          </button>
        </div>
      )}

      {viewedStudent && (
        <p className="muted-text" style={{ marginBottom: "12px" }}>
          Showing credentials for: {viewedStudent}
          {viewedStudentId ? ` (ID: ${viewedStudentId})` : ""}
        </p>
      )}

      {loading && <p className="muted-text">Loading credentials...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && credentials.length === 0 && (
        <p className="muted-text">No credentials issued yet.</p>
      )}

      {!loading && credentials.length > 0 && (
        <p className="stats-chip">
          Total Credentials: {credentials.length}
        </p>
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
