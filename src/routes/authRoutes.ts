import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user"; // Ensure this is correct

const router = Router();

// Explicitly define request and response types
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        // Check if all required fields are provided
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

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists." });
            return;
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = new User({ email, password: hashedPassword });

        await user.save();

        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
});

export default router;
