import { ethers } from "ethers";
import ScholarLedger from "../abi/ScholarLedger.json";

const CONTRACT_ADDRESS = "0x4f78B06602a3f022F5f8D7C20b8b5393F4b96d15";
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
