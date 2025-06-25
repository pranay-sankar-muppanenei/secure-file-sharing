require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initDB } = require("./config/db");


const authRoutes = require("./routes/auth");  
 // to be created
const opsRoutes = require("./routes/ops");     // to be created
const clientRoutes = require("./routes/client"); // to be created

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Set up routes
app.use("/auth", authRoutes);
app.use("/ops", opsRoutes);
app.use("/client", clientRoutes);

// Start server after DB connects
const start = async () => {
  try {
    const db = await initDB();
    app.locals.db = db;  // Save DB to app.locals so routes can use it

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (e) {
    console.error("❌ Error starting server:", e.message);
  }
};

start();
