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
// @ts-ignore
router.post('/medmatch_score', (req, res) => {
    const input = req.body;
    // Validate inputs
    const requiredFields = [
        'bloodGroup', 'crossmatch', 'organAvailability', 'medicalHistory',
        'age', 'size', 'location', 'urgency', 'donorWillingness'
    ];
    for (const field of requiredFields) {
        if (typeof input[field] !== 'number') {
            return res.status(400).json({ error: `Missing or invalid field: ${field}` });
        }
    }
    const totalScore = input.bloodGroup +
        input.crossmatch +
        input.organAvailability +
        input.medicalHistory +
        input.age +
        input.size +
        input.location +
        input.urgency +
        input.donorWillingness;
    const response = {
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
exports.default = router;
