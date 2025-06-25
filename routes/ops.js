const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const authenticate = require("../middleware/authMiddleware");

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save in uploads/ folder
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const allowedTypes = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",     // .docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",          // .xlsx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"   // .pptx
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .docx, .xlsx, and .pptx files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// ✅ Real Upload Route (protected for ops)
router.post("/upload", authenticate, upload.single("file"), async (req, res) => {
  const db = req.app.locals.db;

  try {
    const user = req.user;

    if (user.role !== "ops") {
      return res.status(403).json({ error: "Only ops users can upload files" });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded or invalid file type" });
    }

    // Save metadata to DB
    await db.run(
      "INSERT INTO files (original_name, stored_name, mime_type, uploaded_by) VALUES (?, ?, ?, ?)",
      [file.originalname, file.filename, file.mimetype, user.user_id]
    );

    return res.status(200).json({
      message: "File uploaded successfully",
      filename: file.filename
    });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error:err});
  }
});

module.exports = router;
