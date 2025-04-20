import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, {IUser} from "../models/user";
import Donor, {IDonor} from "../models/donar_model";
import MyResponse from "../util/response_controller";

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


interface MedMatchInput {
    bloodGroup: number;       // 0–20
    crossmatch: number;       // 0–20
    organAvailability: number; // 0–10
    medicalHistory: number;    // 0–10
    age: number;               // 0–10
    size: number;              // 0–10
    location: number;          // 0–10
    urgency: number;           // 0–30
    donorWillingness: number;  // 0–10
}

interface MedMatchResponse {
    totalScore: number;
    details: Record<string, number>;
}

// @ts-ignore
router.post('/medmatch_score', (req: Request, res: Response) => {
    const input: MedMatchInput = req.body;

    // Validate inputs
    const requiredFields: (keyof MedMatchInput)[] = [
        'bloodGroup', 'crossmatch', 'organAvailability', 'medicalHistory',
        'age', 'size', 'location', 'urgency', 'donorWillingness'
    ];

    for (const field of requiredFields) {
        if (typeof input[field] !== 'number') {
            return res.status(400).json({ error: `Missing or invalid field: ${field}` });
        }
    }

    const totalScore =
        input.bloodGroup +
        input.crossmatch +
        input.organAvailability +
        input.medicalHistory +
        input.age +
        input.size +
        input.location +
        input.urgency +
        input.donorWillingness;

    const response: MedMatchResponse = {
        totalScore,
        details: {
            bloodGroup: input.bloodGroup,
            crossmatch: input.crossmatch,
            organAvailability: input.organAvailability,
            medicalHistory: input.medicalHistory,
            age: input.age,
            size: input.size,
            location: input.location,
            urgency: input.urgency,
            donorWillingness: input.donorWillingness,
        }
    };

    return res.json(response);
});

export default router;


