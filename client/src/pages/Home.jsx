import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { Link } from "react-router-dom";
import ConnectWallet from "../components/ConnectWallet";
import StudentDashboard from "../components/StudentDashboard";
import UploadCredential from "../components/UploadCredential";
import { getStudentByWallet } from "../utils/studentRegistryApi";

// Home page = the connected-wallet experience.
// Public verification, profile, and scanner live on their own routes
// and do not require a wallet at all.
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
      <ConnectWallet />

      {account && (
        <p className="muted-text" style={{ margin: "12px 2px 20px" }}>
          Need to share your credentials publicly?{" "}
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
