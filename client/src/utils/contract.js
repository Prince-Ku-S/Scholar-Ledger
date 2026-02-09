import { ethers } from "ethers";
import ScholarLedger from "../abi/ScholarLedger.json";

const CONTRACT_ADDRESS = "0x8A0Df224fA36753b4a1286071a02266898fA4b88";
const GANACHE_CHAIN_ID = "0x539"; // 1337 in hex

export const getContract = async () => {
  if (!window.ethereum) {
    alert("MetaMask not installed");
    return;
  }

  // 🔒 Force Ganache network
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: GANACHE_CHAIN_ID }],
  });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    ScholarLedger.abi,
    signer
  );
};
