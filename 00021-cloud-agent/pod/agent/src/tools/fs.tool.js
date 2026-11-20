import fs from "node:fs/promises"
import path from "node:path"
import { tool } from "langchain"
import * as z from "zod"
import env from "../config/env.js"

const MAX_READ_BYTES = 1_000_000
const workshopRoot = path.resolve(env.WORKSHOP_DIR)

const filePath = z.string().min(1).describe("Path relative to the workshop folder, e.g. src/index.js")

function isInside(root, target) {
    const relative = path.relative(root, target)
    return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))
}

/**
 * Resolve a user path inside the workshop and reject traversal or symlink escapes.
 * @param {string} requested Path relative to the workshop folder.
 * @returns {Promise<{ target: string, relative: string }>}
 * @throws {Error} When the path is absolute, empty, or resolves outside the workshop.
 */
export async function resolveWorkshopPath(requested) {
    if (typeof requested !== "string" || !requested.trim() || requested.includes("\0") || path.isAbsolute(requested)) {
        throw new Error("Path must be a non-empty path relative to the workshop folder")
    }

    await fs.mkdir(workshopRoot, { recursive: true })
    const root = await fs.realpath(workshopRoot)
    const target = path.resolve(root, requested)
    if (target === root || !isInside(root, target)) throw new Error("Path must point to a file inside the workshop folder")

    // Check the deepest existing ancestor so symlinked folders cannot redirect writes outside the workshop.
    let existing = target
    while (true) {
        try {
            const real = await fs.realpath(existing)
            if (!isInside(root, real)) throw new Error("Path resolves outside the workshop folder")
            break
        } catch (error) {
            if (error.code !== "ENOENT") throw error
            existing = path.dirname(existing)
        }
    }

    return { target, relative: path.relative(root, target) }
}

async function assertRegularFile(target) {
    const stat = await fs.lstat(target)
    if (stat.isSymbolicLink()) throw new Error("Symbolic links cannot be read or changed by file tools")
    if (!stat.isFile()) throw new Error("Path is not a file")
    return stat
}

/**
 * Read a UTF-8 text file from the workshop.
 * @param {{ path: string }} input
 * @returns {Promise<string>}
 */
export async function readWorkshopFile({ path: requested }) {
    const { target } = await resolveWorkshopPath(requested)
    const stat = await assertRegularFile(target)
    if (stat.size > MAX_READ_BYTES) throw new Error(`File is larger than ${MAX_READ_BYTES} bytes`)
    return fs.readFile(target, "utf8")
}

/**
 * Create a new UTF-8 text file in the workshop without overwriting existing files.
 * @param {{ path: string, content: string }} input
 * @returns {Promise<string>}
 */
export async function createWorkshopFile({ path: requested, content }) {
    const { target, relative } = await resolveWorkshopPath(requested)
    await fs.mkdir(path.dirname(target), { recursive: true })
    await resolveWorkshopPath(requested)
    await fs.writeFile(target, content, { encoding: "utf8", flag: "wx" })
    return `Created ${relative} (${Buffer.byteLength(content)} bytes)`
}

/**
 * Update an existing workshop file by replacing all content or one exact text occurrence.
 * @param {{ path: string, content?: string, oldText?: string, newText?: string }} input
 * @returns {Promise<string>}
 */
export async function updateWorkshopFile({ path: requested, content, oldText, newText }) {
    const { target, relative } = await resolveWorkshopPath(requested)
    await assertRegularFile(target)

    let next = content
    if (next === undefined) {
        if (typeof oldText !== "string" || !oldText || typeof newText !== "string") {
            throw new Error("Provide either content, or both oldText and newText")
        }
        const current = await fs.readFile(target, "utf8")
        const matches = current.split(oldText).length - 1
        if (matches !== 1) throw new Error(`oldText must match exactly once; found ${matches} matches`)
        next = current.replace(oldText, () => newText)
    }

    await fs.writeFile(target, next, "utf8")
    return `Updated ${relative} (${Buffer.byteLength(next)} bytes)`
}

export const readFileTool = tool(readWorkshopFile, {
    name: "read_file",
    description: "Read a UTF-8 text file from the shared workshop folder.",
    schema: z.object({ path: filePath }),
})


export const createFileTool = tool(createWorkshopFile, {
    name: "create_file",
    description: "Create a new UTF-8 text file in the shared workshop folder. Fails if the file already exists.",
    schema: z.object({ path: filePath, content: z.string().describe("Complete file content") }),
})

export const updateFileTool = tool(updateWorkshopFile, {
    name: "update_file",
    description: "Update an existing workshop file. Provide content to replace the whole file, or oldText and newText to replace one exact occurrence.",
    schema: z.object({
        path: filePath,
        content: z.string().optional().describe("Complete replacement content"),
        oldText: z.string().min(1).optional().describe("Exact text that occurs once in the file"),
        newText: z.string().optional().describe("Replacement for oldText"),
    }),
})

export const fsTools = [readFileTool, createFileTool, updateFileTool]
