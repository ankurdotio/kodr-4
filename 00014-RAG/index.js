import fs from "fs/promises"
import { PDFParse } from "pdf-parse"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Pinecone } from "@pinecone-database/pinecone";
import { config } from "dotenv"
import { v7 as uuid } from "uuid"

config()

const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://localhost:11434", // Default value
});


// ––––––––––– converting PDF into Text –––––––––––––––––
const parser = new PDFParse({
    data: await fs.readFile("./story.pdf")
})

const pdfText = await parser.getText()


// ––––––––––– converting Text into Chunks –––––––––––––––––
const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 300, chunkOverlap: 50 })
const chunks = await splitter.splitText(pdfText.text)

console.log("Number of chunks: ", chunks.length)



// –––––––––––––––– Chunks into Embeddings –––––––––––––––––
const vectors = (await embeddings.embedDocuments(chunks))
    .map((vector, index) => {
        return {
            id: uuid(),
            values: vector,
            metadata: {
                text: chunks[ index ]
            }
        }
    })

console.log(vectors)



// –––––––––––––––– store Embeddings into vector Store –––––––
// 1. Instantiate the client using the PINECONE_API_KEY environment variable
const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

const index = await pc.index({
    name: "arav"
})

await index.upsert({
    records: vectors
})