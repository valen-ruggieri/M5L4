import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { CreateRepositorySchema, createRepositoryTool } from '../tools/repos.js';
class MCPServerWrapper {
    tools = [];
    handlers = {};
    server = new Server({ name: "github-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });
    constructor() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: this.tools }));
        this.server.setRequestHandler(CallToolRequestSchema, async (req) => {
            const handler = this.handlers[req.params.name];
            if (!handler)
                throw new Error("Tool no encontrada");
            return handler(req.params.arguments);
        });
    }
    registerTool(name, options, handler) {
        const jsonSchema = zodToJsonSchema(options.inputSchema);
        const { $schema, ...cleanSchema } = jsonSchema;
        this.tools.push({
            name,
            description: options.description,
            inputSchema: {
                type: "object",
                ...cleanSchema
            }
        });
        this.handlers[name] = handler;
    }
    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}
const server = new MCPServerWrapper();
const createRepositoryHandler = async () => ({ content: [{ type: "text", text: "OK" }] });
server.registerTool(createRepositoryTool.name, {
    description: createRepositoryTool.description,
    inputSchema: createRepositoryTool.schema
}, createRepositoryHandler);
server.start().catch(console.error);
//# sourceMappingURL=index.js.map