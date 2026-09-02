import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 100,
        minlength: 3
    },

    description: {
        type: String,
        required: true
    }
})

const noteModel = mongoose.model("notes", noteSchema);

export default noteModel;