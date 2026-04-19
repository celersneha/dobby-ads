import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const toToolSuccess = (data: unknown): CallToolResult => ({
  content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
});

export const toToolError = (error: unknown): CallToolResult => ({
  isError: true,
  content: [
    {
      type: "text",
      text: `Tool failed: ${error instanceof Error ? error.message : "Unexpected error"}`,
    },
  ],
});

export const withToolHandling = async (
  operation: () => Promise<unknown>,
): Promise<CallToolResult> => {
  try {
    return toToolSuccess(await operation());
  } catch (error) {
    return toToolError(error);
  }
};
