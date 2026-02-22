import { useState } from "react";
import { uploadToIPFS } from "../utils/ipfs";
import { getContract } from "../utils/contract";
import { ethers } from "ethers";

function UploadCredential() {
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState("");
  const [status, setStatus] = useState("");
  const [title, setTitle] = useState("");

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

    if(!title){
        alert ("Please enter credential title");
        return;
    }
    const tx = await contract.issueCredential(studentAddress, cidHash, title);
    await tx.wait();

    setStatus("✅ Credential stored on blockchain!");
  };

  return (
    <div>
      <h3>Upload Academic Document</h3>
      <input
        type="text"
        placeholder="Credential Title (e.g. BTech Semester 6)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
            width: "400px",
            display: "block",
            marginBottom: "10px",
        }}
      />

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
