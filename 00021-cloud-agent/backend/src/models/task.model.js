import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    userInput: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [ "pending", "in-progress", "completed", "failed" ],
        default: "pending"
    },
    state: {
        type: Object,
        default: {},
        select: false
    }
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);
export default Task;