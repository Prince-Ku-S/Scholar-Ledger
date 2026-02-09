import ConnectWallet from "./components/ConnectWallet";
import UploadCredential from "./components/UploadCredential";
import VerifyCredential from "./components/VerifyCredential";

function App() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>Scholar Ledger</h1>
      <ConnectWallet />
      <UploadCredential />
      <VerifyCredential />
    </div>
  );
}

export default App;
