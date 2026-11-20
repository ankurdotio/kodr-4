import { after, before, test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs/promises"
import http from "node:http"
import os from "node:os"
import path from "node:path"

let dir
let outside
let server
let tools
let cli
let requestBody

before(async () => {
    dir = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), "agent-workshop-")))
    outside = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), "agent-outside-")))
    await fs.symlink(outside, path.join(dir, "link"))

    server = http.createServer(async (req, res) => {
        let body = ""
        for await (const chunk of req) body += chunk
        requestBody = JSON.parse(body)
        res.writeHead(requestBody.command === "bad" ? 400 : 200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(requestBody.command === "bad"
            ? { success: false, message: "rejected" }
            : { success: true, data: { exitCode: 0, output: "ok\n" } }))
    })
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))

    process.env.WORKSHOP_DIR = dir
    process.env.WORKSHOP_SERVER_URL = `http://127.0.0.1:${server.address().port}`
    tools = await import("../src/tools/fs.tool.js")
    cli = await import("../src/tools/cli.tool.js")
})

after(async () => {
    await new Promise((resolve) => server.close(resolve))
    await fs.rm(dir, { recursive: true, force: true })
    await fs.rm(outside, { recursive: true, force: true })
})

test("creates, reads, and updates files in the workshop", async () => {
    await tools.createFileTool.invoke({ path: "src/app.js", content: "const value = 1\n" })
    await assert.rejects(tools.createWorkshopFile({ path: "src/app.js", content: "" }), /EEXIST/)
    await tools.updateFileTool.invoke({ path: "src/app.js", oldText: "1", newText: "2" })
    assert.equal(await tools.readFileTool.invoke({ path: "src/app.js" }), "const value = 2\n")
    await tools.updateWorkshopFile({ path: "src/app.js", content: "replaced" })
    assert.equal(await fs.readFile(path.join(dir, "src/app.js"), "utf8"), "replaced")
})

test("rejects paths outside the workshop", async () => {
    for (const requested of ["../x", "/etc/passwd", "link/x.txt", "."]) {
        await assert.rejects(tools.createWorkshopFile({ path: requested, content: "x" }), requested)
    }
    assert.deepEqual(await fs.readdir(outside), [])
})

test("sends commands to the workshop server", async () => {
    const result = await cli.runCommandTool.invoke({ command: "npm test", cwd: "src", timeoutMs: 5_000 })
    assert.deepEqual(requestBody, { command: "npm test", cwd: "src", timeoutMs: 5_000 })
    assert.equal(result.output, "ok\n")
    await assert.rejects(cli.runWorkshopCommand({ command: "bad" }), /rejected/)
})
