import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  createFolderService,
  deleteFolderByNameService,
  deleteFolderService,
  getFolderContentByNameService,
  getFolderContentService,
  getFoldersService,
  resolveFolderByNameService,
} from "../services/folder.service.js";

const createFolder = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const { name, parentId } = req.body as {
    name?: string;
    parentId?: string | null;
  };

  const folder = await createFolderService({
    userId: String(userId),
    name: name ?? "",
    parentId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, folder, "Folder created successfully"));
});

const getFolders = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const { parentId, page, limit } = req.query as {
    parentId?: string;
    page?: string;
    limit?: string;
  };

  const result = await getFoldersService({
    userId: String(userId),
    parentId,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Folders fetched successfully"));
});

const getFolderContent = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const folderId = String(req.params.id ?? "");
  if (!folderId) {
    throw new ApiError(400, "Folder id is required");
  }

  const result = await getFolderContentService({
    userId: String(userId),
    folderId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Folder content fetched successfully"));
});

const getFolderContentByName = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const { name, parentId } = req.query as {
    name?: string;
    parentId?: string;
  };

  if (!name?.trim()) {
    throw new ApiError(400, "Folder name is required");
  }

  const result = await getFolderContentByNameService({
    userId: String(userId),
    name,
    parentId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Folder content fetched successfully"));
});

const resolveFolderByName = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const { name, parentId } = req.query as {
    name?: string;
    parentId?: string;
  };

  if (!name?.trim()) {
    throw new ApiError(400, "Folder name is required");
  }

  const folder = await resolveFolderByNameService({
    userId: String(userId),
    name,
    parentId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, folder, "Folder resolved successfully"));
});

const deleteFolder = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const folderId = String(req.params.id ?? "");
  if (!folderId) {
    throw new ApiError(400, "Folder id is required");
  }

  const result = await deleteFolderService({
    userId: String(userId),
    folderId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Folder deleted successfully"));
});

const deleteFolderByName = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const { name, parentId } = req.body as {
    name?: string;
    parentId?: string | null;
  };

  if (!name?.trim()) {
    throw new ApiError(400, "Folder name is required");
  }

  const result = await deleteFolderByNameService({
    userId: String(userId),
    name,
    parentId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Folder deleted successfully"));
});

export {
  createFolder,
  deleteFolder,
  deleteFolderByName,
  getFolderContent,
  getFolderContentByName,
  getFolders,
  resolveFolderByName,
};
