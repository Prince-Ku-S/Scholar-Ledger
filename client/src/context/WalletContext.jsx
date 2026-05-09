import { createContext, useContext, useEffect, useState } from "react";
import { getContract } from "../utils/contract";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [walletError, setWalletError] = useState("");

  // Resolves admin status for a given address without triggering MetaMask popup
  const resolveAdmin = async (addr) => {
    try {
      const contract = await getContract();
      const adminAddress = await contract.universityAdmin();
      setIsAdmin(addr.toLowerCase() === adminAddress.toLowerCase());
    } catch {
      setIsAdmin(false);
    }
  };

  // Single shared connect entry-point used by ConnectWallet button
  const connectWallet = async () => {
    setWalletError("");
    if (!window.ethereum) {
      setWalletError("no_metamask");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const addr = accounts[0];
      setAccount(addr);
      await resolveAdmin(addr);
    } catch {
      // User rejected the connection prompt
      setWalletError("rejected");
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    // Use eth_accounts (no popup) to restore an already-connected session
    window.ethereum
      .request({ method: "eth_accounts" })
      .then(async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await resolveAdmin(accounts[0]);
        }
      });

    // Keep wallet + admin state in sync when user switches accounts in MetaMask
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        setAccount("");
        setIsAdmin(false);
      } else {
        setAccount(accounts[0]);
        await resolveAdmin(accounts[0]);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <WalletContext.Provider value={{ account, isAdmin, connectWallet, walletError }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
