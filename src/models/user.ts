// models/user.ts

import mongoose, { Document, Schema } from "mongoose";
import MyUtil from "../util/my_util";

// 1. Define the interface for User
export interface IUser extends Document {
    createdDate: Date;
    userId: string;
    displayName?: string;
    email: string[];        // array of emails
    password: string;
    roleArray: string[];
    phoneArray: string[];
    phoneGuestArray: string[];
    isActive: boolean;
}

// 2. Define schema
const UserSchema = new Schema<IUser>({
    createdDate: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: String,
        default: function () {
            return MyUtil.getMongooseId();
        }
    },
    displayName: String,
    email: [String],
    password: String,
    roleArray: [String],
    phoneArray: [String],
    phoneGuestArray: [String],
    isActive: {
        type: Boolean,
        default: true
    },
}, { collection: "User" });

// 3. Export model with IUser
export default mongoose.model<IUser>("User", UserSchema);
