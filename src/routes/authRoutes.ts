import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, {IUser} from "../models/user";

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

export default router;
