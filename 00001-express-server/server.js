import express from "express"

const app = express()

app.use(express.json())


let notes = []
/**
 *
 * note = {
 * title
 * description
 * }
 */

app.get("/", function (req, res) {
    res.json({
        message: "API is alive",
        data: "Hello KODR"
    })
})

app.post("/api/note", function (req, res) {
    console.log(notes)

    const note = {
        title: req.body.title,
        description: req.body.description
    }

    notes.push(note)

    res.status(201).json({
        message: "Note created Successfully",
        data: {
            note
        }
    })
    console.log(notes)
})



app.get("/api/note", function (req, res) {
    res.status(200).json({
        message: "Notes fetched Successfully",
        data: {
            notes
        }
    })
})

app.delete("/api/note/:abc", function (req, res) {
    const index = req.params.abc

    notes.splice(Number(index), 1)

    return res.status(204).json({
        message: "Note Deleted Successfully"
    })

})

app.patch("/api/note/:index", function (req, res) {

    const index = req.params.index
    const description = req.body.description

    notes[ index ].description = description

    res.status(200).json({
        message: "note updated successfully",
        data: {
            note: notes[ index ]
        }
    })

})


app.listen(3000)