import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const getStudentByStudentId = async (studentId) => {
  const res = await api.get(`/students/by-student-id/${studentId}`);
  return res.data;
};

export const getStudentByWallet = async (walletAddress) => {
  const res = await api.get(`/students/by-wallet/${walletAddress}`);
  return res.data;
};

export const upsertStudent = async (payload) => {
  const res = await api.post("/students", payload);
  return res.data;
};
