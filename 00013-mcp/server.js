import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod";


// ── MCP server ───────────────────────────────────────────────
const server = new McpServer({ name: "calendar-server", version: "1.0.0" });


const events = [
    { id: "evt_1", title: "Team standup", start: "2026-10-17T10:00:00+05:30", end: "2026-10-17T10:15:00+05:30" },
];

// –– Register Tool ––––––––––––––––––––––––––––––––––––––––––––
server.registerTool(
    "list_events",
    {
        description: "List all the events of the user",
        inputSchema: z.object({}),
        annotations: {
            readOnlyHint: true
        }
    },
    async () => {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(events)
                }
            ]
        }
    }
)


// ── Connect the stdio transport ──────────────────────────────
async function main() { 
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("calendar-server running on stdio"); // stderr, never stdout
    console.log("MCP server is up")
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});