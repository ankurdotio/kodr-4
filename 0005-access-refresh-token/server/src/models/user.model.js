import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: [ /^\S+@\S+\.\S+$/, 'Please use a valid email address' ]
    },
    password: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true })


const userModel = mongoose.model("users", userSchema)

export default userModel