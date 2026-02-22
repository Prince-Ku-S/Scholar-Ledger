import ConnectWallet from "./components/ConnectWallet";
import UploadCredential from "./components/UploadCredential";
import VerifyCredential from "./components/VerifyCredential";
import StudentDashboard from "./components/StudentDashboard";

function App() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>Scholar Ledger</h1>
      <ConnectWallet />
      <StudentDashboard />
      <UploadCredential />

      <hr style={{ margin: "60px 0" }} />

      <h2>Public Credential Verification</h2>

      <p>
        Anyone can verify a credential using student wallet address
        and CID.
      </p>

      <VerifyCredential />
    </div>
  );
}

export default App;
