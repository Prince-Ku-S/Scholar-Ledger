import { useWallet } from "../context/WalletContext";

// BUG-07: reads from shared WalletContext instead of managing isolated local state
function ConnectWallet() {
  const { account, isAdmin, connectWallet } = useWallet();

  return (
    <div className="app-card wallet-card">
      <button className="btn btn-primary" onClick={connectWallet}>
        {account ? "Wallet Connected" : "Connect Wallet"}
      </button>
      {account && (
        <p className="muted-text">
          Connected: {account}{" "}
          <strong className={isAdmin ? "role-admin" : "role-student"}>
            ({isAdmin ? "Admin" : "Student"})
          </strong>
        </p>
      )}
    </div>
  );
}

export default ConnectWallet;
