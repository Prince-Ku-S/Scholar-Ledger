const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const PINATA_API_KEY = "b48b57730171547ad047";
const PINATA_SECRET_KEY = "b57974f63c39c37c6cd317490b7b9ee63614db5552035a1df9c7b8bffefb0d2e";

async function uploadToIPFS(filePath) {
  try {
    const data = new FormData();
    data.append("file", fs.createReadStream(filePath));

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxContentLength: "Infinity",
        headers: {
          ...data.getHeaders(),
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    console.log("✅ File uploaded to IPFS");
    console.log("📌 IPFS CID:", response.data.IpfsHash);

    return response.data.IpfsHash;
  } catch (error) {
    console.error("❌ IPFS upload failed:", error.message);
  }
}

// Example usage
uploadToIPFS("./sample_transcript.pdf");
