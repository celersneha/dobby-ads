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
  folderId: z.string().optional().describe("Folder id"),
  folderName: z.string().optional().describe("Folder name (human-friendly)"),
  parentId: z
    .string()
    .optional()
    .describe("Parent folder id when folderName is ambiguous"),
};

export const registerGetFolderContentTool: RegisterTool = (server) => {
  server.registerTool(
    "getFolderContent",
    {
      description: "Get subfolders and images inside a folder",
      inputSchema,
    },
    async ({ folderId, folderName, parentId }) =>
      withToolErrorHandling(async () => {
        const resolvedFolderId = await resolveFolderId({
          folderId,
          folderName,
          parentId,
        });

        const response = await apiClient.get(
          `/folder/${resolvedFolderId}/content`,
          {
            headers: withAuth(),
          },
        );

        return toolSuccess(
          response.data?.data,
          "Folder content fetched successfully.",
        );
      }),
  );
};
