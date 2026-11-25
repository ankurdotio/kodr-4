export async function streamAgentResponse(agent, messages, agentName, emitEvent) {
    let response
    const stream = await agent.stream({ messages }, {
        streamMode: [ "updates", "values" ],
    })

    for await (const [ mode, chunk ] of stream) {
        if (mode === "values") response = chunk
        if (mode !== "updates" || !chunk.model_request) continue

        const update = chunk.model_request
        const message = update.messages?.at(-1)
        const content = {
            ...update.structuredResponse,
            content: message?.content,
            tool_calls: message?.tool_calls,
            reasoning_content: message?.additional_kwargs?.reasoning_content,
        }

        if (update.structuredResponse || content.content?.length || content.tool_calls?.length || content.reasoning_content) {
            await emitEvent({ agent: agentName, content })
        }
    }

    if (!response?.structuredResponse) {
        throw new Error(`${agentName} did not return a structured response`)
    }
    return response
}
