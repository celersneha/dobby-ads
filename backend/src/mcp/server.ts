import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerHostedMcpTools } from "./tools/index.js";

export const buildUserScopedMcpServer = ({
  userId,
}: {
  userId: string;
}): McpServer => {
  const server = new McpServer({
    name: "dobby-ads-hosted-mcp",
    version: "1.0.0",
  });

  registerHostedMcpTools(server, userId);

  return server;
};
