import mongoose from "mongoose"


const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    refreshTokenHash: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true })

const sessionModel = mongoose.model("sessions", sessionSchema)

export default sessionModel