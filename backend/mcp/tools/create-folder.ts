import * as z from "zod/v4";
import type { RegisterTool } from "./shared.js";
import {
  apiClient,
  toolSuccess,
  withAuth,
  withToolErrorHandling,
} from "./shared.js";

const inputSchema = {
  name: z.string().min(1).max(120).describe("Folder name"),
  parentId: z.string().optional().describe("Parent folder id (optional)"),
};

export const registerCreateFolderTool: RegisterTool = (server) => {
  server.registerTool(
    "createFolder",
    {
      description: "Create a new folder in the image drive",
      inputSchema,
    },
    async ({ name, parentId }) =>
      withToolErrorHandling(async () => {
        const response = await apiClient.post(
          "/folder",
          {
            name,
            ...(parentId ? { parentId } : {}),
          },
          {
            headers: withAuth(),
          },
        );

        return toolSuccess(response.data?.data, "Folder created successfully.");
      }),
  );
};
