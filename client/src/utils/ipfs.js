import axios from "axios";

const PINATA_API_KEY = "b48b57730171547ad047";
const PINATA_SECRET_KEY = "b57974f63c39c37c6cd317490b7b9ee63614db5552035a1df9c7b8bffefb0d2e";

export const uploadToIPFS = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      maxContentLength: "Infinity",
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    }
  );

  return res.data.IpfsHash;
};
