require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDatabase } = require("./db/db");

async function startServer() {
  await initDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json());

  const frontendBuild = path.join(__dirname, "frontend", "dist");
  app.use(express.static(frontendBuild));

  app.use("/api/users", require("./routes/users"));
  app.use("/api/sessions", require("./routes/sessions"));
  app.use("/api/insight", require("./routes/insights"));
  app.use("/api/analysis", require("./routes/analysis"));
  app.use("/api/settings", require("./routes/settings"));
  app.use("/api/data", require("./routes/data"));
  app.use("/api/campus-pulse", require("./routes/campusPulse"));
  app.use("/api/feedback", require("./routes/feedback"));
  app.use("/api/admin", require("./routes/admin"));

  app.get("/health", (req, res) => {
    res.json({ app: "Bhaav Backend", status: "Running", version: "1.0" });
  });

  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({
        success: false,
        message: "Bhaav API route not found.",
        path: req.originalUrl
      });
    }
    res.sendFile(path.join(frontendBuild, "index.html"));
  });

  app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  });

  const PORT = parseInt(process.env.PORT, 10) || 4000;
  app.listen(PORT, () => {
    console.log("Bhaav backend running on http://localhost:" + PORT);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
