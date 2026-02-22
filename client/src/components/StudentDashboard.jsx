import { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import { ethers } from "ethers";

function StudentDashboard() {
  const [credentials, setCredentials] = useState([]);
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadCredentials();
    checkAdmin();
  }, []);

  const loadCredentials = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const studentAddress = accounts[0];
      setWallet(studentAddress);

      const contract = await getContract();
      const count = await contract.getCredentialCount(studentAddress);

      const records = [];

      for (let i = 0; i < count; i++) {
        const cred = await contract.getCredential(studentAddress, i);

        records.push({
          index: i,
          cidHash: cred[0],
          title: cred[1],
          issuedOn: new Date(
            Number(cred[2]) * 1000
          ).toLocaleDateString(),
          revoked: cred[3],
          issuer: cred[4],
        });
      }

      setCredentials(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkAdmin = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const contract = await getContract();
      const adminAddress = await contract.universityAdmin();

      if (accounts[0].toLowerCase() === adminAddress.toLowerCase()) {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevoke = async (studentAddress, index) => {
    try {
      const contract = await getContract();

      const tx = await contract.revokeCredential(
        studentAddress,
        index
      );

      await tx.wait();

      alert("Credential revoked successfully");

      // Refresh credentials
      loadCredentials();
    } catch (err) {
      console.error(err);
      alert("Revoke failed");
    }
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h2>Student Dashboard</h2>

      

      {loading && <p>Loading credentials...</p>}

      {!loading && credentials.length === 0 && (
        <p>No credentials issued yet.</p>
      )}

      {!loading && credentials.length > 0 && (
        <p style={{ marginBottom: "20px", fontWeight: "bold" }}>
          Total Credentials: {credentials.length}
        </p>
      )}

      {!loading &&
        credentials.map((cred) => (
          <div
            key={cred.index}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "6px",
              backgroundColor: cred.revoked ? "#ffe6e6" : "#e6ffe6",
            }}
          >
            <h4>{cred.title}</h4>
            <p>Issued On: {cred.issuedOn}</p>
            <p>
              Status:{" "}
              <strong>
                {cred.revoked ? "Revoked" : "Active"}
              </strong>
            </p>
            <p>
              Issuer:{" "}
              {cred.issuer.slice(0, 6)}...
              {cred.issuer.slice(-4)}
            </p>

            <p>
              CID Hash: {cred.cidHash.slice(0, 10)}...
              {cred.cidHash.slice(-6)}
            </p>

            {isAdmin && !cred.revoked && (
              <button
                onClick={() => handleRevoke(wallet, cred.index)}
                style={{
                  marginTop: "10px",
                  padding: "6px 12px",
                  backgroundColor: "#ff4d4d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Revoke Credential
              </button>
            )}
          </div>
        ))}
    </div>
  );
}

export default StudentDashboard;
