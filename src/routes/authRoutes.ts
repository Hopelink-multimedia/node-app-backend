import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user"; // Ensure this is correct

const router = Router();

// Explicitly define request and response types
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });

        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
});

export default router;
