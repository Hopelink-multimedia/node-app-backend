"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes")); // Ensure correct path
const ws_1 = require("ws"); // WebSocket for signaling
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// WebSocket server to handle WebRTC signaling
const wss = new ws_1.Server({ server });
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
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Routes
app.use("/api", authRoutes_1.default);
const PORT = process.env.PORT || 5000;
mongoose_1.default
    .connect(process.env.MONGO_URI || "")
    .then(() => {
    console.log("MongoDB Connected");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
    .catch((err) => console.error(err));
