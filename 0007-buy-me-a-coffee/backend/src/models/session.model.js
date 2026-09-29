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
        default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // default to 7 days from now
    }
}, { timestamps: true })

function hashTokenAndUpdateExpiry() {
    const update = this.getUpdate ? this.getUpdate() : this;
    if (update.tokenHash) {
        update.tokenHash = crypto.createHash("sha512").update(update.tokenHash).digest("hex");
    }
}

// perform sha512 for refresh token hashing
sessionSchema.pre("save", hashTokenAndUpdateExpiry);
sessionSchema.pre("findOneAndUpdate", hashTokenAndUpdateExpiry);

export const sessionModel = mongoose.model("Session", sessionSchema);