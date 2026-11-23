import { graph } from "./src/graph/graph.js"

const response = await graph.invoke({
    userInput: "create a express server with import statement"
}, {
    recursionLimit: 100
})


console.log(response)