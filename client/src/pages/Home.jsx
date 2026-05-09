import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { Link } from "react-router-dom";
import ConnectWallet from "../components/ConnectWallet";
import StudentDashboard from "../components/StudentDashboard";
import UploadCredential from "../components/UploadCredential";
import { getStudentByWallet } from "../utils/studentRegistryApi";

function Home() {
  const { account } = useWallet();
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    if (!account) {
      setStudentId("");
      return;
    }
    getStudentByWallet(account)
      .then((student) => setStudentId(student.studentId || ""))
      .catch(() => setStudentId(""));
  }, [account]);

  return (
    <div>
      {/* Landing hero — only shown before wallet is connected */}
      {!account && (
        <div className="hero">
          <h1>Your Credentials, On-Chain & Tamper-Proof</h1>
          <p>
            Scholar Ledger lets universities issue academic certificates directly on the
            blockchain — so anyone, anywhere can verify them instantly. No paperwork, no
            waiting, no fraud.
          </p>
          <div className="hero-features">
            <div className="hero-feature">🔒 Blockchain-secured</div>
            <div className="hero-feature">⚡ Instant verification</div>
            <div className="hero-feature">📄 Shareable QR codes</div>
            <div className="hero-feature">🌐 No account needed to verify</div>
          </div>
        </div>
      )}

      <ConnectWallet />

      {account && (
        <p className="muted-text" style={{ margin: "12px 2px 20px" }}>
          Want to share your credentials publicly?{" "}
          <Link to={studentId ? `/profile/student/${studentId}` : `/profile/${account}`}>
            View your public profile →
          </Link>
        </p>
      )}

      <StudentDashboard />
      <UploadCredential />
    </div>
  );
}

export default Home;
