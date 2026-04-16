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
  imageId: z.string().optional().describe("Image id to delete"),
  imageName: z.string().optional().describe("Image name to delete"),
  folderId: z
    .string()
    .optional()
    .describe("Folder id for scoped image-name lookup"),
  folderName: z
    .string()
    .optional()
    .describe("Folder name for scoped image-name lookup"),
  parentId: z
    .string()
    .optional()
    .describe("Parent folder id when folderName is ambiguous"),
};

export const registerDeleteImageTool: RegisterTool = (server) => {
  server.registerTool(
    "deleteImage",
    {
      description: "Delete an image from drive",
      inputSchema,
    },
    async ({ imageId, imageName, folderId, folderName, parentId }) =>
      withToolErrorHandling(async () => {
        const trimmedImageId = imageId?.trim();
        const trimmedImageName = imageName?.trim();

        if (!trimmedImageId && !trimmedImageName) {
          throw new Error("Either imageId or imageName is required");
        }

        const response = trimmedImageId
          ? await apiClient.delete(`/image/${trimmedImageId}`, {
              headers: withAuth(),
            })
          : await apiClient.delete("/image/by-name", {
              headers: withAuth(),
              data: {
                name: trimmedImageName,
                ...(folderId || folderName
                  ? {
                      folderId: await resolveFolderId({
                        folderId,
                        folderName,
                        parentId,
                      }),
                    }
                  : {}),
              },
            });

        return toolSuccess(response.data?.data, "Image deleted successfully.");
      }),
  );
};
