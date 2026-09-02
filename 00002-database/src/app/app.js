import express from 'express';
import notesModel from "../model/notes.model.js";

const app = express();
app.use(express.json());

app.post("/api/notes", async (req, res) => {
    const { title, description } = req.body;


    const note = await notesModel.create({
        title,
        description
    })

    return res.status(201).json({
        message: "Note created successfully",
        data: {
            note
        }
    })

})


app.get("/api/notes", async (req, res) => {

    const notes = await notesModel.find();

    res.status(200).json({
        message: "Notes fetched successfully",
        data: {
            notes
        }
    })

})

app.delete("/api/notes/:id", async (req, res) => {
    await notesModel.findByIdAndDelete(req.params.id)

    res.status(204).json({
        message: "Note deleted successfully"
    })
})

app.patch("/api/notes/:id", async (req, res) => {

    const description = req.body.description;

    const note = await notesModel.findByIdAndUpdate(req.params.id, { description }, { new: true })

    res.status(200).json({
        message: "Note updated successfully",
        data: {
            note
        }
    })
})


export default app;