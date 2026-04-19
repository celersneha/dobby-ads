import * as z from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  deleteImageByNameService,
  deleteImageService,
  getImagesByFolderService,
  resolveImageByNameService,
  uploadImageFromUrlService,
} from "../../services/image.service.js";
import { resolveFolderIdForUser } from "../folder-resolver.js";
import { withToolHandling } from "../tool-result.js";

export const registerImageTools = (server: McpServer, userId: string): void => {
  server.registerTool(
    "listImages",
    {
      description: "List images in a folder",
      inputSchema: {
        folderId: z.string().optional(),
        folderName: z.string().optional(),
        parentId: z.string().optional(),
      },
    },
    ({ folderId, folderName, parentId }) =>
      withToolHandling(async () => {
        const resolvedFolderId = await resolveFolderIdForUser({
          userId,
          folderId,
          folderName,
          parentId,
        });

        return getImagesByFolderService({ userId, folderId: resolvedFolderId });
      }),
  );

  server.registerTool(
    "uploadImageFromUrl",
    {
      description:
        "Upload an image from a public URL into a target folder for the authenticated user",
      inputSchema: {
        imageUrl: z.string().url(),
        imageName: z.string().optional(),
        folderId: z.string().optional(),
        folderName: z.string().optional(),
        parentId: z.string().optional(),
      },
    },
    ({ imageUrl, imageName, folderId, folderName, parentId }) =>
      withToolHandling(async () => {
        const resolvedFolderId = await resolveFolderIdForUser({
          userId,
          folderId,
          folderName,
          parentId,
        });

        return uploadImageFromUrlService({
          userId,
          folderId: resolvedFolderId,
          imageUrl,
          imageName,
        });
      }),
  );

  server.registerTool(
    "deleteImage",
    {
      description: "Delete image by id or by name",
      inputSchema: {
        imageId: z.string().optional(),
        imageName: z.string().optional(),
        folderId: z.string().optional(),
        folderName: z.string().optional(),
        parentId: z.string().optional(),
      },
    },
    ({ imageId, imageName, folderId, folderName, parentId }) =>
      withToolHandling(async () => {
        if (imageId?.trim()) {
          return deleteImageService({ userId, imageId });
        }

        let scopedFolderId = folderId;
        if (!scopedFolderId && folderName?.trim()) {
          scopedFolderId = await resolveFolderIdForUser({
            userId,
            folderName,
            parentId,
          });
        }

        return deleteImageByNameService({
          userId,
          imageName: imageName ?? "",
          folderId: scopedFolderId,
        });
      }),
  );

  server.registerTool(
    "resolveImageByName",
    {
      description: "Resolve image metadata by name",
      inputSchema: {
        imageName: z.string().min(1),
        folderId: z.string().optional(),
        folderName: z.string().optional(),
        parentId: z.string().optional(),
      },
    },
    ({ imageName, folderId, folderName, parentId }) =>
      withToolHandling(async () => {
        let scopedFolderId = folderId;
        if (!scopedFolderId && folderName?.trim()) {
          scopedFolderId = await resolveFolderIdForUser({
            userId,
            folderName,
            parentId,
          });
        }

        return resolveImageByNameService({
          userId,
          imageName,
          folderId: scopedFolderId,
        });
      }),
  );
};
