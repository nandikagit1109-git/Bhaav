require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();


// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());

app.use(express.json());


// =====================================
// DATABASE
// =====================================

require("./db/db");


// =====================================
// ROUTES
// =====================================

const adminRoutes = require("./routes/admin");


// USERS
app.use(
  "/api/users",
  require("./routes/users")
);


// SESSIONS
app.use(
  "/api/sessions",
  require("./routes/sessions")
);


// INSIGHTS
app.use(
  "/api/insight",
  require("./routes/insights")
);


// ⭐ FULL PERSONAL ANALYSIS
app.use(
  "/api/analysis",
  require("./routes/analysis")
);


// SETTINGS
app.use(
  "/api/settings",
  require("./routes/settings")
);


// DATA
app.use(
  "/api/data",
  require("./routes/data")
);


// CAMPUS PULSE
app.use(
  "/api/campus-pulse",
  require("./routes/campusPulse")
);


// FEEDBACK
app.use(
  "/api/feedback",
  require("./routes/feedback")
);


// ADMIN
app.use(
  "/api/admin",
  adminRoutes
);


// =====================================
// HEALTH CHECK
// =====================================

app.get("/", (req, res) => {

  res.json({
    app: "Bhaav Backend",
    status: "Running ",
    version: "1.0"
  });

});


// =====================================
// 404 HANDLER
// =====================================

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "Bhaav API route not found.",
    path: req.originalUrl
  });

});


// =====================================
// GLOBAL ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {

  console.error(
    "Server error:",
    err
  );

  res.status(500).json({
    success: false,
    message: "Internal server error."
  });

});


// =====================================
// START SERVER
// =====================================

const PORT =
  parseInt(process.env.PORT, 10) || 4000;


app.listen(PORT, () => {

  console.log(
    ` Bhaav backend running on http://localhost:${PORT}`
  );

});