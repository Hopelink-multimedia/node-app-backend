import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes"; // Ensure correct path

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Fix: Properly use the router
app.use("/api", authRoutes);

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI || "")
    .then(() => {
        console.log("MongoDB Connected");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error(err));
