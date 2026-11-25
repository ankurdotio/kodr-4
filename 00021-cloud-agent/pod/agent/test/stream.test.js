import { test } from "node:test"
import assert from "node:assert/strict"
import { setImmediate } from "node:timers/promises"
import { BaseChatModel } from "@langchain/core/language_models/chat_models"
import { AIMessage, HumanMessage, createAgent, providerStrategy, tool } from "langchain"
import * as z from "zod"
import { streamAgentResponse } from "../src/graph/stream.js"

class ScriptedChatModel extends BaseChatModel {
    constructor(responses) {
        super({})
        this.responses = [ ...responses ]
    }

    _llmType() {
        return "scripted"
    }

    bindTools() {
        return this
    }

    async _generate() {
        const message = this.responses.shift()
        assert.ok(message, "Unexpected extra model request")
        return { generations: [{ message, text: "" }] }
    }
}

test("streams real planner tool calls and final structured output without empty tool-update events", async () => {
    const report = {
        plan: "Create index.html and verify its contents.",
        tasks: [{ name: "Create boilerplate", subTasks: ["Write index.html"] }],
    }
    const toolCall = { id: "list-1", name: "list_files", args: {}, type: "tool_call" }
    const agent = createAgent({
        model: new ScriptedChatModel([
            new AIMessage({
                content: "",
                tool_calls: [ toolCall ],
                additional_kwargs: { reasoning_content: "Inspect the workspace first." },
            }),
            new AIMessage(JSON.stringify(report)),
        ]),
        tools: [ tool(() => "index.html", { name: "list_files", description: "List files", schema: z.object({}) }) ],
        responseFormat: providerStrategy(z.object({
            plan: z.string(),
            tasks: z.array(z.object({ name: z.string(), subTasks: z.array(z.string()) })),
        })),
    })
    const events = []
    const response = await streamAgentResponse(agent, [ new HumanMessage("Create boilerplate") ], "planner", async (event) => {
        await setImmediate()
        events.push(JSON.parse(JSON.stringify(event)))
    })

    assert.equal(events.length, 2)
    assert.equal(events[0].agent, "planner")
    assert.deepEqual(events[0].content.tool_calls, [ toolCall ])
    assert.equal(events[0].content.reasoning_content, "Inspect the workspace first.")
    assert.equal(events[1].content.plan, report.plan)
    assert.deepEqual(events[1].content.tasks, report.tasks)
    assert.deepEqual(response.structuredResponse, report)
    assert.equal(response.messages.length, 4)
})

test("emits main and tester structured fields from state, including false status", async (t) => {
    for (const [ agentName, schema, report ] of [
        [ "main", z.object({ result: z.string(), blockers: z.array(z.string()) }), { result: "Created index.html", blockers: [] } ],
        [ "test", z.object({ testResults: z.string(), status: z.boolean() }), { testResults: "Missing title", status: false } ],
    ]) {
        await t.test(agentName, async () => {
            const agent = createAgent({
                model: new ScriptedChatModel([ new AIMessage(JSON.stringify(report)) ]),
                responseFormat: providerStrategy(schema),
            })
            const events = []
            await streamAgentResponse(agent, [ new HumanMessage("Run task") ], agentName, (event) => {
                events.push(event)
            })
            assert.equal(events.length, 1)
            assert.equal(events[0].agent, agentName)
            for (const [ key, value ] of Object.entries(report)) {
                assert.deepEqual(events[0].content[key], value)
            }
        })
    }
})

test("propagates rejected Redis writes instead of continuing silently", async () => {
    const agent = createAgent({
        model: new ScriptedChatModel([ new AIMessage('{"plan":"Inspect files"}') ]),
        responseFormat: providerStrategy(z.object({ plan: z.string() })),
    })
    await assert.rejects(streamAgentResponse(agent, [ new HumanMessage("Plan") ], "planner", async () => {
        await setImmediate()
        throw new Error("Redis write failed")
    }), /Redis write failed/)
})

test("fails explicitly when the stream finishes without structured output", async () => {
    const agent = {
        async *stream() {
            yield [ "values", { messages: [] } ]
            yield [ "updates", { tools: { messages: [] } } ]
        },
    }
    await assert.rejects(streamAgentResponse(agent, [], "planner", () => {
        assert.fail("Should not emit an empty event")
    }), /planner did not return a structured response/)
})
