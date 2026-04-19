import * as z from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  createFolderService,
  deleteFolderByNameService,
  deleteFolderService,
  getFolderContentService,
  getFoldersService,
} from "../../services/folder.service.js";
import { resolveFolderIdForUser } from "../folder-resolver.js";
import { withToolHandling } from "../tool-result.js";

export const registerFolderTools = (
  server: McpServer,
  userId: string,
): void => {
  server.registerTool(
    "createFolder",
    {
      description: "Create a folder for the authenticated user",
      inputSchema: {
        name: z.string().min(1).max(120),
        parentId: z.string().optional(),
      },
    },
    ({ name, parentId }) =>
      withToolHandling(async () =>
        createFolderService({
          userId,
          name,
          parentId,
        }),
      ),
  );

  server.registerTool(
    "getFolderContent",
    {
      description: "Get folders and images inside a specific folder",
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

        return getFolderContentService({
          userId,
          folderId: resolvedFolderId,
        });
      }),
  );

  server.registerTool(
    "listFolders",
    {
      description: "List folders under a parent folder",
      inputSchema: {
        parentId: z.string().optional(),
        page: z.number().int().positive().optional(),
        limit: z.number().int().positive().optional(),
      },
    },
    ({ parentId, page, limit }) =>
      withToolHandling(async () =>
        getFoldersService({
          userId,
          parentId,
          page,
          limit,
        }),
      ),
  );

  server.registerTool(
    "deleteFolder",
    {
      description: "Delete folder by id or by name",
      inputSchema: {
        folderId: z.string().optional(),
        folderName: z.string().optional(),
        parentId: z.string().optional(),
      },
    },
    ({ folderId, folderName, parentId }) =>
      withToolHandling(async () => {
        if (folderId?.trim()) {
          return deleteFolderService({ userId, folderId });
        }

        return deleteFolderByNameService({
          userId,
          name: folderName ?? "",
          parentId,
        });
      }),
  );
};
