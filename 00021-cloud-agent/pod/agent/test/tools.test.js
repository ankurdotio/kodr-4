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

test("creates, reads, and updates multiple files in one call", async () => {
    const created = await tools.createFilesTool.invoke({ files: [
        { path: "src/a.js", content: "const a = 1\nconst b = 1\n" },
        { path: "src/b.js", content: "b" },
    ] })
    assert.deepEqual(created.created.map((file) => file.path), ["src/a.js", "src/b.js"])

    await tools.updateFilesTool.invoke({ files: [
        { path: "src/a.js", edits: [{ oldText: "a = 1", newText: "a = 2" }, { oldText: "b = 1", newText: "b = 3" }] },
        { path: "src/b.js", content: "replaced" },
    ] })

    const read = await tools.readFilesTool.invoke({ paths: ["src/a.js", "src/b.js", "missing.js"] })
    assert.deepEqual(read.files.slice(0, 2), [
        { path: "src/a.js", content: "const a = 2\nconst b = 3\n" },
        { path: "src/b.js", content: "replaced" },
    ])
    assert.match(read.files[2].error, /ENOENT/)
})

test("writes nothing when any file in a batch is invalid", async () => {
    await assert.rejects(tools.createWorkshopFiles({ files: [
        { path: "batch/new.js", content: "x" },
        { path: "src/a.js", content: "x" },
    ] }), /already exists/)
    await assert.rejects(fs.access(path.join(dir, "batch/new.js")))

    await assert.rejects(tools.updateWorkshopFiles({ files: [
        { path: "src/b.js", content: "changed" },
        { path: "src/a.js", edits: [{ oldText: "not there", newText: "x" }] },
    ] }), /found 0 matches/)
    assert.equal(await fs.readFile(path.join(dir, "src/b.js"), "utf8"), "replaced")

    await assert.rejects(tools.createWorkshopFiles({ files: [
        { path: "dup.js", content: "1" },
        { path: "./dup.js", content: "2" },
    ] }), /more than once/)
})

test("rejects paths outside the workshop", async () => {
    for (const requested of ["../x", "/etc/passwd", "link/x.txt", "."]) {
        await assert.rejects(tools.createWorkshopFiles({ files: [{ path: requested, content: "x" }] }), requested)
    }
    assert.deepEqual(await fs.readdir(outside), [])
    await assert.rejects(tools.listWorkshopFiles({ path: ".." }))
})

test("lists workshop files without expanding ignored folders or symlinks", async () => {
    await fs.mkdir(path.join(dir, "node_modules/pkg"), { recursive: true })
    const all = await tools.listFilesTool.invoke({})
    assert.deepEqual(all.entries, [
        { path: "link", type: "symlink" },
        { path: "node_modules/", type: "directory", skipped: true },
        { path: "src/", type: "directory" },
        { path: "src/a.js", type: "file", size: 24 },
        { path: "src/b.js", type: "file", size: 8 },
    ])
    const src = await tools.listWorkshopFiles({ path: "src", recursive: false })
    assert.deepEqual(src.entries.map((entry) => entry.path), ["src/a.js", "src/b.js"])
    assert.equal(all.truncated, false)
})

test("sends commands to the workshop server", async () => {
    const result = await cli.runCommandTool.invoke({ command: "npm test", cwd: "src", timeoutMs: 5_000 })
    assert.deepEqual(requestBody, { command: "npm test", cwd: "src", timeoutMs: 5_000 })
    assert.equal(result.output, "ok\n")
    await assert.rejects(cli.runWorkshopCommand({ command: "bad" }), /rejected/)
})
