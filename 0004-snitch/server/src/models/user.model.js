import mongoose from "mongoose"


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
    },
    email: {
        type: String,
        required: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        maxLength: 100
    },
    passwordHash: {
        type: String,
        required: function () {
            return !this.providerId;
        },
        select: false
    },
    role: {
        type: String,
        required: true,
        default: "user",
        enum: [ "user", "seller" ]
    },
    provider: {
        type: String,
        enum: [ "local", "google", "github", "linkedin" ],
        required: true
    },
    providerId: {
        type: String,
    }
})

const userModel = mongoose.model("user", userSchema)
export default userModel