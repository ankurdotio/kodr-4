import mongoose from "mongoose"


const contextSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
    /**
     * personal
     * work/
     * project/
     * learning/
     */
}, { timestamps: true })

const Context = mongoose.model("Context", contextSchema)

export default Context