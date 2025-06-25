const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /auth/signup
const signup = async (req, res) => {
  const db = req.app.locals.db;
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      "INSERT INTO users (email, password, role, is_verified) VALUES (?, ?, 'client', 0)",
      [email, hashedPassword]
    );

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const verificationURL = `http://localhost:5000/auth/verify/${token}`;

    return res.status(201).json({
      message: "Signup successful. Verify your email.",
      verification_link: verificationURL,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /auth/verify/:token
const verifyEmail = async (req, res) => {
  const db = req.app.locals.db;
  const { token } = req.params;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { email } = payload;

    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.is_verified) {
      return res.json({ message: "Email already verified" });
    }

    await db.run("UPDATE users SET is_verified = 1 WHERE email = ?", [email]);
    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verification error:", err.message);
    return res.status(400).json({ error: "Invalid or expired token" });
  }
};

const login = async (req, res) => {
    const db = req.app.locals.db;
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
  
    try {
      const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      if (!user.is_verified) {
        return res.status(401).json({ error: "Please verify your email first" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      const token = jwt.sign(
        {
          user_id: user.id,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified   // 👈 ADD THIS LINE
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );
      
      return res.json({
        message: "Login successful",
        token,
        role: user.role
      });
  
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  
// 👇 Make sure this comes AFTER both functions are defined
module.exports = { signup, verifyEmail,login };
