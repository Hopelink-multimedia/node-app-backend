import mongoose from "mongoose";
import MyUtil from "../util/my_util";

const UserSchema = new mongoose.Schema({
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
}, {collection: "User"});

export default mongoose.model("User", UserSchema);
