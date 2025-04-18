"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const my_util_1 = __importDefault(require("../util/my_util"));
const UserSchema = new mongoose_1.default.Schema({
    createdDate: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: String,
        default: function () {
            return my_util_1.default.getMongooseId();
        }
    },
    displayName: String,
    email: [String],
    password: String,
    roleArray: [String],
}, { collection: "User" });
exports.default = mongoose_1.default.model("User", UserSchema);
