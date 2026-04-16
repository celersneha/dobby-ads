import * as z from "zod/v4";
import type { RegisterTool } from "./shared.js";
import {
  apiClient,
  resolveFolderId,
  toolSuccess,
  withAuth,
  withToolErrorHandling,
} from "./shared.js";

const inputSchema = {
  folderId: z.string().optional().describe("Folder id to delete"),
  folderName: z.string().optional().describe("Folder name to delete"),
  parentId: z
    .string()
    .optional()
    .describe("Parent folder id when folderName is ambiguous"),
};

export const registerDeleteFolderTool: RegisterTool = (server) => {
  server.registerTool(
    "deleteFolder",
    {
      description: "Delete a folder with nested content",
      inputSchema,
    },
    async ({ folderId, folderName, parentId }) =>
      withToolErrorHandling(async () => {
        const resolvedFolderId = await resolveFolderId({
          folderId,
          folderName,
          parentId,
        });

        const response = await apiClient.delete(`/folder/${resolvedFolderId}`, {
          headers: withAuth(),
        });

        return toolSuccess(response.data?.data, "Folder deleted successfully.");
      }),
  );
};
