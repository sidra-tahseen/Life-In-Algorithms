const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const decisionRoutes = require("./routes/decisionRoutes");
const mongoose = require("mongoose");
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/decisions", decisionRoutes);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Life in Algorithms API is running."
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "Life in Algorithms Backend"
    });
});

const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully.");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error("MongoDB connection failed:", error.message);
    });
