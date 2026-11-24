import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    role: {
        type: String,
        enum: [ "human", "tool", "ai" ],
        required: true,
        default: "ai",
    },
    agent: {
        type: String,
        enum: [ "planner", "main", "tester" ],
        required: function () {
            return this.role === "ai";
        }
    },
    content: {
        type: String,
        required: true
    },
    tool_calls: [
        {
            name: {
                type: String,
                required: true
            },
            args: {
                type: mongoose.Schema.Types.Mixed
            },
            tool_call_id: {
                type: String,
                required: true
            }
        }
    ],
    tool_call_id: {
        type: String,
    },
    tool_name: {
        type: String,
    }
})

export default mongoose.model("Message", messageSchema);