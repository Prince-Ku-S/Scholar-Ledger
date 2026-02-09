import { useState } from "react";
import { getContract } from "../utils/contract";
import { ethers } from "ethers";

function VerifyCredential() {
  const [cid, setCid] = useState("");
  const [result, setResult] = useState("");

  const verify = async () => {
    const contract = await getContract();

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const studentAddress = accounts[0];
    const cidHash = ethers.keccak256(ethers.toUtf8Bytes(cid));

    const isValid = await contract.verifyCredential(
      studentAddress,
      cidHash
    );

    setResult(isValid ? "✅ Valid Credential" : "❌ Invalid Credential");
  };

  return (
    <div>
      <h3>Verify Credential</h3>
      <input
        type="text"
        placeholder="Enter IPFS CID"
        value={cid}
        onChange={(e) => setCid(e.target.value)}
      />
      <button onClick={verify}>Verify</button>
      {result && <p>{result}</p>}
    </div>
  );
}

export default VerifyCredential;
