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
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../models/user")); // Ensure this is correct
const router = (0, express_1.Router)();
// Explicitly define request and response types
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const existingUser = yield user_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists." });
            return;
        }
        // Hash the password before saving
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        const user = new user_1.default({ email, password: hashedPassword });
        yield user.save();
        res.status(201).json({ message: "User registered successfully." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
}));
exports.default = router;
