import { START, END, StateGraph } from "@langchain/langgraph"
import * as z from "zod"
import { MainNode, PlannerNode, TestNode } from "./node.js"




const graphState = z.object({
    // ––––––––––––––––––––––– user input and agent histories –––––––––––––––––
    userInput: z.string().describe("User input for the current session"),
    mainHistory: z.array(z.any()).describe("History of main agent interactions"),
    testHistory: z.array(z.any()).describe("History of test agent interactions"),
    planHistory: z.array(z.any()).describe("History of plan interactions"),

    // ––––––––––––––––––––––– tasks and planning –––––––––––––––––
    tasks: z.array(z.object({
        name: z.string().describe("Name of the task"),
        subTasks: z.array(z.string()).describe("List of sub-tasks")
    })).describe("List of tasks"),

    // ––––––––––––––––––––––– test and replanning counters –––––––––––––––––
    testFailedCount: z.number().optional(),
    replannedCount: z.number().optional(),
    testStatus: z.boolean().describe("Status of the test").default(false),

    // ––––––––––––––––––––––– overall state of the session –––––––––––––––––

    plan: z.string().optional(),
    mainResults: z.string().describe("Results from the main agent"),
    testResults: z.string().describe("Results from the test agent"),
    blockers: z.array(z.string()).describe("List of blockers encountered during this session")
})



export const graph = new StateGraph(graphState)
    .addNode("main", MainNode)
    .addNode("planner", PlannerNode)
    .addNode("test", TestNode)
    .addEdge(START, "planner")
    .addEdge("planner", "main")
    .addEdge("main", "test")
    .addConditionalEdges("test", (state, config) => {

        const { testStatus, replannedCount, testFailedCount } = state

        if (testStatus || replannedCount >= 1) {
            return "__end__"
        }

        if (testFailedCount >= 5) {
            return "planner"
        }

        return "main"
    }, [ "main", "planner", "__end__" ])
    .compile()

