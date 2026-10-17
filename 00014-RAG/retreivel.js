import { OllamaEmbeddings } from "@langchain/ollama";
import { Pinecone } from "@pinecone-database/pinecone";
import { config } from "dotenv"


config()

const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://localhost:11434", // Default value
});

const vector = await embeddings.embedQuery("How was the Arav's Intership ?")

console.log(vector)

// 1. Instantiate the client using the PINECONE_API_KEY environment variable
const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

const index = await pc.index({
    name: "arav"
})

const result = await index.query({
    vector,
    topK: 20,
    includeMetadata: true,
})

console.log(result.matches)