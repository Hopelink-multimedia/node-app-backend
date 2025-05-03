import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import authRoutes from "./routes/authRoutes"; // Ensure correct path
import { Server } from "ws"; // WebSocket for signaling

dotenv.config();

const app = express();
const server = http.createServer(app);

// WebSocket server to handle WebRTC signaling
const wss = new Server({ server });

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());
        switch (data.type) {
            case "offer":
                ws.send(JSON.stringify({ type: "offer", sdp: data.sdp }));
                break;
            case "answer":
                ws.send(JSON.stringify({ type: "answer", sdp: data.sdp }));
                break;
            case "candidate":
                ws.send(JSON.stringify({ type: "candidate", candidate: data.candidate }));
                break;
            default:
                break;
        }
    });
});

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api", authRoutes);

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI || "")
    .then(() => {
        console.log("MongoDB Connected");
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error(err));
