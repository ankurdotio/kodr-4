import { tool } from "langchain"
import fs from "fs/promises"
import path from "path"
import * as z from "zod"


/**
 * @constant
 * @description List of files and directories to ignore when reading directories.
 */
const ignored = [ "node_modules", ".git", "dist", ".DS_Store" ];

/**
 * @function
 * @name readDir
 * @description Reads the content of a directory, ignoring certain files and directories like [node_modules, .git, dist, .DS_Store].
 */
async function readDir(dirPath) {
    const entries = (await fs.readdir(dirPath, { withFileTypes: true }))
        .filter(entry => !ignored.includes(entry.name));
    return entries;
}

/**
 * @name list_directories
 * @description Lists all the content recursively (directories & files) in a given path. Ignores the content like [node_modules, .git, dist,.DS_Store and everything else that is typically ignored]
 */
export const list_directories = tool(
    async ({ dirPath }) => {
        const result = [];
        async function listDirRecursive(currentPath) {
            const entries = await readDir(currentPath);
            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);
                result.push(fullPath);
                if (entry.isDirectory()) {
                    await listDirRecursive(fullPath);
                }
            }
        }
        await listDirRecursive(dirPath);
        return result;
    },
    {
        name: "list_directories",
        description: "Lists all the content recursively (directories & files) in a given path, ignoring certain files and directories like [node_modules, .git, dist, .DS_Store].",
        schema: z.object({
            dirPath: z.string().min(1, "Directory path is required")
        })
    }
)