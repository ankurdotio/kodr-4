import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            minlength: 3,
            maxlength: 30,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        bio: {
            type: String,
            maxlength: 160,
        },
        avatarUrl: {
            type: String,
            default: "https://ik.imagekit.io/hnoglyswo0/user-avatar.webp"
        },
        coffeePrice: {
            type: Number,
            min: 2000,
            max: 50000,
            default: 5000,
        },
        password: { type: String, required: true, minlength: 8, select: false }
    },
    { timestamps: true },
);

userSchema.pre("save", async function hashPassword() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

/**
 * Compares a plain-text password against the stored hash.
 * @param {string} candidate
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
};

export const UserModel = mongoose.model("User", userSchema);