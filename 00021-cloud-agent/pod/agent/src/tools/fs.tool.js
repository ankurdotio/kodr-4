import fs from "node:fs/promises"
import path from "node:path"
import { tool } from "langchain"
import * as z from "zod"
import env from "../config/env.js"

const MAX_READ_BYTES = 1_000_000
const MAX_BATCH_FILES = 50
const MAX_LIST_ENTRIES = 2_000
const IGNORED_DIRS = new Set([ "node_modules", ".git" ])
const workshopRoot = path.resolve(env.WORKSHOP_DIR)

const filePath = z.string().min(1).describe("Path relative to the workshop folder, e.g. src/index.js")

function isInside(root, target) {
    const relative = path.relative(root, target)
    return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))
}

/**
 * Resolve a user path inside the workshop and reject traversal or symlink escapes.
 * @param {string} requested Path relative to the workshop folder.
 * @param {{ allowRoot?: boolean }} [options] Allow the workshop folder itself (for listing).
 * @returns {Promise<{ root: string, target: string, relative: string }>}
 * @throws {Error} When the path is absolute, empty, or resolves outside the workshop.
 */
export async function resolveWorkshopPath(requested, { allowRoot = false } = {}) {
    if (typeof requested !== "string" || !requested.trim() || requested.includes("\0") || path.isAbsolute(requested)) {
        throw new Error("Path must be a non-empty path relative to the workshop folder")
    }

    await fs.mkdir(workshopRoot, { recursive: true })
    const root = await fs.realpath(workshopRoot)
    const target = path.resolve(root, requested)
    if ((target === root && !allowRoot) || !isInside(root, target)) {
        throw new Error("Path must point to a file inside the workshop folder")
    }

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

    return { root, target, relative: path.relative(root, target) || "." }
}

async function assertRegularFile(target) {
    const stat = await fs.lstat(target)
    if (stat.isSymbolicLink()) throw new Error("Symbolic links cannot be read or changed by file tools")
    if (!stat.isFile()) throw new Error("Path is not a file")
    return stat
}

function assertUniquePaths(items) {
    const seen = new Set()
    for (const { relative } of items) {
        if (seen.has(relative)) throw new Error(`${relative}: the same file appears more than once`)
        seen.add(relative)
    }
}

async function exists(target) {
    try {
        await fs.lstat(target)
        return true
    } catch (error) {
        if (error.code === "ENOENT") return false
        throw error
    }
}

/**
 * Read several UTF-8 text files. Each file succeeds or fails independently.
 * @param {{ paths: string[] }} input
 * @returns {Promise<{ files: Array<{ path: string, content?: string, error?: string }> }>}
 */
export async function readWorkshopFiles({ paths }) {
    const files = await Promise.all(paths.map(async (requested) => {
        try {
            const { target, relative } = await resolveWorkshopPath(requested)
            const stat = await assertRegularFile(target)
            if (stat.size > MAX_READ_BYTES) throw new Error(`File is larger than ${MAX_READ_BYTES} bytes`)
            return { path: relative, content: await fs.readFile(target, "utf8") }
        } catch (error) {
            return { path: requested, error: error.message }
        }
    }))
    return { files }
}

/**
 * Create several new UTF-8 text files. All paths are validated before any file is written.
 * @param {{ files: Array<{ path: string, content: string }> }} input
 * @returns {Promise<{ created: Array<{ path: string, bytes: number }> }>}
 * @throws {Error} When any path is invalid, duplicated, or already exists; nothing is written then.
 */
export async function createWorkshopFiles({ files }) {
    const planned = await Promise.all(files.map(async ({ path: requested, content }) => {
        const resolved = await resolveWorkshopPath(requested).catch((error) => {
            throw new Error(`${requested}: ${error.message}`)
        })
        if (await exists(resolved.target)) throw new Error(`${resolved.relative}: file already exists`)
        return { ...resolved, requested, content }
    }))
    assertUniquePaths(planned)

    const created = []
    for (const file of planned) {
        await fs.mkdir(path.dirname(file.target), { recursive: true })
        // Re-check after mkdir in case a parent was swapped for a symlink in the meantime.
        await resolveWorkshopPath(file.requested)
        await fs.writeFile(file.target, file.content, { encoding: "utf8", flag: "wx" })
        created.push({ path: file.relative, bytes: Buffer.byteLength(file.content) })
    }
    return { created }
}

function applyEdits(relative, current, edits) {
    return edits.reduce((text, { oldText, newText }, index) => {
        const matches = text.split(oldText).length - 1
        if (matches !== 1) {
            throw new Error(`${relative}: edit ${index + 1} oldText must match exactly once; found ${matches} matches`)
        }
        return text.replace(oldText, () => newText)
    }, current)
}

/**
 * Update several existing files. Every change is computed and validated before any file is written.
 * @param {{ files: Array<{ path: string, content?: string | null, edits?: Array<{ oldText: string, newText: string }> | null }> }} input
 * @returns {Promise<{ updated: Array<{ path: string, bytes: number }> }>}
 * @throws {Error} When any path or edit is invalid; nothing is written then.
 */
export async function updateWorkshopFiles({ files }) {
    const planned = await Promise.all(files.map(async ({ path: requested, content, edits }) => {
        const resolved = await resolveWorkshopPath(requested).catch((error) => {
            throw new Error(`${requested}: ${error.message}`)
        })
        const hasContent = content !== undefined && content !== null
        const hasEdits = edits !== undefined && edits !== null && edits.length > 0
        if (hasContent === hasEdits) {
            throw new Error(`${resolved.relative}: provide either content or a non-empty edits list`)
        }
        await assertRegularFile(resolved.target).catch((error) => {
            throw new Error(`${resolved.relative}: ${error.message}`)
        })
        const next = content ?? applyEdits(resolved.relative, await fs.readFile(resolved.target, "utf8"), edits)
        return { ...resolved, next }
    }))
    assertUniquePaths(planned)

    const updated = []
    for (const file of planned) {
        await fs.writeFile(file.target, file.next, "utf8")
        updated.push({ path: file.relative, bytes: Buffer.byteLength(file.next) })
    }
    return { updated }
}

/**
 * List files and folders in the workshop without following symbolic links.
 * @param {{ path?: string | null, recursive?: boolean | null, includeIgnored?: boolean | null }} input
 * @returns {Promise<{ path: string, entries: Array<{ path: string, type: string, size?: number }>, truncated: boolean }>}
 */
export async function listWorkshopFiles({ path: requested = ".", recursive = true, includeIgnored = false } = {}) {
    const { root, target, relative } = await resolveWorkshopPath(requested ?? ".", { allowRoot: true })
    const stat = await fs.lstat(target)
    if (!stat.isDirectory()) throw new Error("Path is not a directory")

    const entries = []
    let truncated = false
    const walk = async (dir) => {
        const children = (await fs.readdir(dir, { withFileTypes: true }))
            .sort((a, b) => a.name.localeCompare(b.name))
        for (const child of children) {
            if (entries.length >= MAX_LIST_ENTRIES) {
                truncated = true
                return
            }
            const full = path.join(dir, child.name)
            const entryPath = path.relative(root, full)
            if (child.isSymbolicLink()) {
                entries.push({ path: entryPath, type: "symlink" })
            } else if (child.isDirectory()) {
                const ignored = !includeIgnored && IGNORED_DIRS.has(child.name)
                entries.push({ path: `${entryPath}/`, type: "directory", ...(ignored && { skipped: true }) })
                if ((recursive ?? true) && !ignored) await walk(full)
            } else if (child.isFile()) {
                entries.push({ path: entryPath, type: "file", size: (await fs.lstat(full)).size })
            }
        }
    }
    await walk(target)
    return { path: relative, entries, truncated }
}

const fileList = (item) => z.array(item).min(1).max(MAX_BATCH_FILES)

export const listFilesTool = tool(listWorkshopFiles, {
    name: "list_files",
    description: "List files and folders in the shared workshop folder. Recursive by default; node_modules and .git are shown but not expanded unless includeIgnored is true.",
    schema: z.object({
        path: z.string().min(1).nullable().describe("Folder relative to the workshop, default '.'"),
        recursive: z.boolean().nullable().describe("List subfolders recursively, default true"),
        includeIgnored: z.boolean().nullable().describe("Also expand node_modules and .git, default false"),
    }),
})

export const readFilesTool = tool(readWorkshopFiles, {
    name: "read_files",
    description: "Read one or more UTF-8 text files from the shared workshop folder in a single call. Each file reports its own content or error.",
    schema: z.object({ paths: fileList(filePath).describe("Files to read") }),
})

export const createFilesTool = tool(createWorkshopFiles, {
    name: "create_files",
    description: "Create one or more new UTF-8 text files in the shared workshop folder in a single call. Parent folders are created automatically. Fails without writing anything if any file already exists or any path is invalid.",
    schema: z.object({
        files: fileList(z.object({ path: filePath, content: z.string().describe("Complete file content") })),
    }),
})

export const updateFilesTool = tool(updateWorkshopFiles, {
    name: "update_files",
    description: "Update one or more existing workshop files in a single call. For each file provide either content to replace the whole file, or edits: exact oldText/newText replacements applied in order, each matching exactly once. Omit the unused field or set it to null. Nothing is written unless every change is valid.",
    schema: z.object({
        files: fileList(z.object({
            path: filePath,
            content: z.string().nullable().default(null).describe("Complete replacement content; omit or null when using edits"),
            edits: z.array(z.object({
                oldText: z.string().min(1).describe("Exact text that occurs once in the file"),
                newText: z.string().describe("Replacement for oldText"),
            })).min(1).nullable().default(null).describe("Exact replacements; omit or null when using content"),
        })),
    }),
})

export const fsTools = [ listFilesTool, readFilesTool, createFilesTool, updateFilesTool ]
