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
 * @tool
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



/**
 * @tool
 * @name read_files
 * @description Reads the content of the files at given paths. discard files that are outside of the current directory.
 */
export const read_files = tool(
    async ({ filePaths }) => {
        const result = await Promise.all(
            filePaths.map(async (filePath) => {
                if (!filePath.startsWith(process.cwd())) {
                    return {
                        filePath,
                        content: "<discarded>file is outside of the current directory</discarded>"
                    };
                }
                const content = await fs.readFile(filePath, "utf-8");
                return { filePath, content };
            })
        )

        return result;
    },
    {
        name: "read_files",
        description: "Reads the content of the files at given paths. Discards files that are outside of the current directory.",
        schema: z.object({
            filePaths: z.array(
                z.string()
                    .min(1, "File path is required"))
                .min(1, "At least one file path is required")
        })
    }
)


/**
 * @tool
 * @name create_files
 * @description Creates new files at the specified paths with the given content.
 */
export const create_files = tool(
    async ({ files }) => {
        const results = []
        await Promise.all(
            files.map(async ({ filePath, content }) => {
                if (!filePath.startsWith(process.cwd())) {
                    results.push({
                        filePath,
                        success: false,
                        message: "File is outside of the current directory"
                    });
                    return;
                }
                await fs.writeFile(filePath, content, "utf-8");
                results.push({
                    filePath,
                    success: true,
                    message: "File created successfully"
                });
            })
        )

        return results;
    },
    {
        name: "create_files",
        description: "Creates new files at the specified paths with the given content.",
        schema: z.object({
            files: z.array(
                z.object({
                    filePath: z.string().min(1, "File path is required"),
                    content: z.string().min(1, "File content is required")
                })
            ).min(1, "At least one file is required")
        })
    }
)


/**
 * @tool
 * @name edit_files
 * @description Edits the content of existing files at the specified paths. Replaces the specified content with the new content.
 */
export const edit_files = tool(
    async ({ files }) => {
        const results = []
        await Promise.all(
            files.map(async ({ filePath, content, replaceContent }) => {
                // ./index.html,"<h2>heading</h2>","<h1>Heading</h1>"
                if (!filePath.startsWith(process.cwd())) {
                    results.push({
                        filePath,
                        success: false,
                        message: "File is outside of the current directory"
                    });
                    return;
                }

                if (!replaceContent) {
                    await fs.writeFile(filePath, content, "utf-8");
                    results.push({
                        filePath,
                        success: true,
                        message: "File edited successfully"
                    });
                    return;
                }

                const fileContent = await fs.readFile(filePath, "utf-8");
                const updatedContent = fileContent.replace(replaceContent, content);
                await fs.writeFile(filePath, updatedContent, "utf-8");
                results.push({
                    filePath,
                    success: true,
                    message: "File edited successfully"
                });
            })
        )
        return results
    },
    {
        name: "edit_files",
        description: `Edits the content of existing files at the specified paths.
         Replaces the specified content with the new content.
         Replace the entire content of the file if no replaceContent is provided.
         `,
        schema: z.object({
            files: z.array(
                z.object({
                    filePath: z.string().min(1, "File path is required"),
                    content: z.string().min(1, "New file content is required").describe("New content to replace the old content"),
                    replaceContent: z.string().describe("Content to be replaced in the file, provide empty string to replace the entire content")
                })
            ).min(1, "At least one file is required")
        })
    }
)