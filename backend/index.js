const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoute");
const videoRoutes = require("./routes/videoroute");
const userJourneyRoutes = require("./routes/userjourney");
const transcriptionRoutes = require("./routes/summariser"); // Added transcription route

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses JSON request bodies

// Database Connection
const mongoUrl = process.env.mongo_url; // Standardized naming convention

if (!mongoUrl) {
    console.error("❌ MongoDB URL is missing. Please check your .env file.");
    process.exit(1); // Exit process if no DB URL is found
}

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1); // Exit process on DB connection failure
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/user-journey", userJourneyRoutes);
app.use("/api/transcription", transcriptionRoutes); // Added transcription route

// Health Check Route
app.get("/", (req, res) => {
    res.json({ message: "Server is running ✅" });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
