import mongoose from "mongoose";


const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    tokenHash: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    }
}, { timestamps: true })


// perform sha512 for refresh token hashing
sessionSchema.pre("save", function (next) {
    if (this.isModified("tokenHash")) {
        const crypto = require("crypto");
        this.tokenHash = crypto.createHash("sha512").update(this.tokenHash).digest("hex");
    }
    next();
});

export const sessionModel = mongoose.model("Session", sessionSchema);