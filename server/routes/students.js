const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

const isWalletAddress = (value) => /^0x[a-fA-F0-9]{40}$/.test(value || "");

router.get("/", async (_req, res) => {
  try {
    const students = await Student.find({ isActive: true })
      .sort({ studentId: 1 })
      .lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message || "Could not fetch students." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { studentId, walletAddress, fullName, department, graduationYear } =
      req.body || {};

    if (!studentId?.trim()) {
      return res.status(400).json({ error: "studentId is required." });
    }
    if (!isWalletAddress(walletAddress)) {
      return res.status(400).json({ error: "Valid walletAddress is required." });
    }

    const student = await Student.findOneAndUpdate(
      { studentId: studentId.trim().toUpperCase() },
      {
        studentId: studentId.trim().toUpperCase(),
        walletAddress: walletAddress.trim().toLowerCase(),
        fullName: fullName?.trim() || "",
        department: department?.trim() || "",
        graduationYear: graduationYear || null,
        isActive: true,
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(student);
  } catch (err) {
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ error: "Student ID or wallet address already exists." });
    }
    res.status(500).json({ error: err.message || "Could not save student." });
  }
});

router.get("/by-student-id/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId.trim().toUpperCase();
    const student = await Student.findOne({ studentId, isActive: true }).lean();
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message || "Lookup failed." });
  }
});

router.get("/by-wallet/:walletAddress", async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress.trim().toLowerCase();
    const student = await Student.findOne({ walletAddress, isActive: true }).lean();
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message || "Lookup failed." });
  }
});

module.exports = router;
