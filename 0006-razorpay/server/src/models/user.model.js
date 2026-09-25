import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

export const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        refreshToken: {
            type: String,
            select: false,
            default: null,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

/**
 * Compares a plaintext password against the stored hash.
 * @param {string} candidate - The plaintext password to check.
 * @returns {Promise<boolean>} Whether the candidate password matches the stored hash.
 */
userSchema.methods.comparePassword = async function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
};

export const UserModel = model("User", userSchema);
