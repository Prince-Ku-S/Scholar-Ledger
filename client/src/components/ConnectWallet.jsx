import { useWallet } from "../context/WalletContext";
import AddressPill from "./AddressPill";

function ConnectWallet() {
  const { account, isAdmin, connectWallet, walletError } = useWallet();

  return (
    <div className="app-card wallet-card">
      {!account ? (
        <>
          <div>
            <h2 style={{ margin: "0 0 6px", fontSize: 18 }}>Connect Your Wallet</h2>
            <p className="muted-text" style={{ margin: "0 0 14px" }}>
              Sign in with your MetaMask wallet to view or manage your academic credentials.
              Your credentials are stored securely on the blockchain.
            </p>
          </div>

          <div>
            <button className="btn btn-primary" onClick={connectWallet} id="connect-wallet-btn">
              🔗 Connect MetaMask
            </button>
          </div>

          {walletError === "no_metamask" && (
            <div className="banner banner-info">
              <span>🦊</span>
              <div>
                <strong>MetaMask not found.</strong>{" "}
                Please{" "}
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  install MetaMask
                </a>{" "}
                browser extension to connect your wallet. It's free and takes under a minute.
              </div>
            </div>
          )}

          {walletError === "rejected" && (
            <div className="banner banner-error">
              <span>⚠️</span>
              <div>
                Connection was cancelled. Click <strong>Connect MetaMask</strong> and approve
                the request in the MetaMask popup to continue.
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="wallet-connected-info">
          <span className="wallet-dot" />
          <div>
            <span style={{ fontSize: 13, color: "var(--clr-text-muted)", marginRight: 6 }}>
              Connected as
            </span>
            <AddressPill address={account} />
            {" "}
            <span className={isAdmin ? "role-admin" : "role-student"}>
              ({isAdmin ? "⚙️ Admin" : "🎓 Student"})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConnectWallet;
