import { useState } from "react";
import { uploadToIPFS } from "../utils/ipfs";
import { getContract } from "../utils/contract";
import { ethers } from "ethers";

function UploadCredential() {
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState("");
  const [status, setStatus] = useState("");

  const handleUploadAndStore = async () => {
    if (!file) return alert("Select a file");

    setStatus("Uploading to IPFS...");
    const ipfsCid = await uploadToIPFS(file);
    setCid(ipfsCid);

    setStatus("Storing CID hash on blockchain...");
    const contract = await getContract();

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const studentAddress = accounts[0]; // demo: admin issues to self

    const cidHash = ethers.keccak256(ethers.toUtf8Bytes(ipfsCid));

    const tx = await contract.addCredential(studentAddress, cidHash);
    await tx.wait();

    setStatus("✅ Credential stored on blockchain!");
  };

  return (
    <div>
      <h3>Upload Academic Document</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUploadAndStore}>
        Upload & Store on Blockchain
      </button>

      {cid && <p>📌 IPFS CID: {cid}</p>}
      {status && <p>{status}</p>}
    </div>
  );
}

export default UploadCredential;
