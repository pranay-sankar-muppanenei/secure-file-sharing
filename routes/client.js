const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");

// GET /client/files — already exists

// GET /client/download-link/:id
router.get("/download-link/:id", authenticate, async (req, res) => {
  const db = req.app.locals.db;
  const user = req.user;

  if (user.role !== "client" || user.is_verified !== 1) {
    return res.status(403).json({ error: "Access denied. Verified clients only." });
  }

  const fileId = req.params.id;
  try {
    const file = await db.get("SELECT * FROM files WHERE id = ?", [fileId]);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Sign a short-lived token
    const downloadToken = jwt.sign(
      {
        file_id: file.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "5m" } // 5-minute expiry
    );

    const downloadLink = `http://localhost:5000/client/download/${downloadToken}`;
    return res.json({ download_link: downloadLink, message: "success" });
  } catch (err) {
    console.error("Download link error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /client/download/:token
// GET /client/download/:token
router.get("/download/:token", authenticate, async (req, res) => {
  const db = req.app.locals.db;
  const { token } = req.params;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Final access checks
    if (req.user.role !== "client" || req.user.email !== payload.email) {
      return res.status(403).json({ error: "Unauthorized access to this file" });
    }

    const file = await db.get("SELECT * FROM files WHERE id = ?", [payload.file_id]);
    if (!file) return res.status(404).json({ error: "File not found" });

    const filePath = `uploads/${file.stored_name}`;
    return res.download(filePath, file.original_name);
  } catch (err) {
    console.error("Token error:", err.message);
    return res.status(400).json({ error: "Invalid or expired download link" });
  }
});


module.exports = router;
