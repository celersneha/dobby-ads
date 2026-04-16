import * as z from "zod/v4";
import type { RegisterTool } from "./shared.js";
import {
  apiClient,
  buildUploadForm,
  resolveFolderId,
  toolSuccess,
  withAuth,
  withToolErrorHandling,
} from "./shared.js";

const inputSchema = {
  folderId: z.string().optional().describe("Target folder id"),
  folderName: z.string().optional().describe("Target folder name"),
  parentId: z
    .string()
    .optional()
    .describe("Parent folder id when folderName is ambiguous"),
  localFilePath: z
    .string()
    .min(1)
    .describe("Absolute or relative local file path"),
};

export const registerUploadImageTool: RegisterTool = (server) => {
  server.registerTool(
    "uploadImage",
    {
      description: "Upload an image to a folder",
      inputSchema,
    },
    async ({ folderId, folderName, parentId, localFilePath }) =>
      withToolErrorHandling(async () => {
        const resolvedFolderId = await resolveFolderId({
          folderId,
          folderName,
          parentId,
        });

        const form = buildUploadForm(resolvedFolderId, localFilePath);

        const response = await apiClient.post("/image/upload", form, {
          headers: withAuth(form.getHeaders()),
          maxBodyLength: Infinity,
        });

        return toolSuccess(response.data?.data, "Image uploaded successfully.");
      }),
  );
};
