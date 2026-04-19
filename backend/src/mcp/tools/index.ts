import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerFolderTools } from "./folder-tools.js";
import { registerImageTools } from "./image-tools.js";

export const registerHostedMcpTools = (
  server: McpServer,
  userId: string,
): void => {
  registerFolderTools(server, userId);
  registerImageTools(server, userId);
};
