import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    newPassword: { type: String, required: true },
    confirmPassword: { type: String, required: true },
});

export default mongoose.model("User", UserSchema);
