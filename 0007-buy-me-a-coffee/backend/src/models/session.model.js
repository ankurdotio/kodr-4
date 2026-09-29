import mongoose from "mongoose";
import crypto from "crypto";

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
sessionSchema.pre("save", function () {
    if (this.isModified("tokenHash")) {
        this.tokenHash = crypto.createHash("sha512").update(this.tokenHash).digest("hex");
    }
});

sessionSchema.pre("findOneAndUpdate", function () {
    const update = this.getUpdate();
    if (update.tokenHash) {
        update.tokenHash = crypto.createHash("sha512").update(update.tokenHash).digest("hex");
    }
    this.expiresAt = new Date();
});

export const sessionModel = mongoose.model("Session", sessionSchema);