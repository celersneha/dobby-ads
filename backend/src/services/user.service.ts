import mongoose from "mongoose";
import { ApiKey } from "../models/api-key.model.js";
import { Folder } from "../models/folder.model.js";
import { Image } from "../models/image.model.js";
import { User } from "../models/user.model.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/api-error.js";

interface DeleteUserResult {
  deletedFolders: number;
  deletedImages: number;
  deletedApiKeys: number;
  failedCloudinaryDeletes: number;
}

const deleteUserAccountService = async ({
  userId,
}: {
  userId: string;
}): Promise<DeleteUserResult> => {
  const session = await mongoose.startSession();

  const summary: Omit<DeleteUserResult, "failedCloudinaryDeletes"> = {
    deletedFolders: 0,
    deletedImages: 0,
    deletedApiKeys: 0,
  };

  let imagePublicIds: string[] = [];

  try {
    await session.withTransaction(async () => {
      const user = await User.findById(userId)
        .select("_id")
        .session(session)
        .lean();

      if (!user?._id) {
        throw new ApiError(404, "User not found");
      }

      const images = await Image.find({ userId })
        .select("publicId")
        .session(session)
        .lean();

      imagePublicIds = images
        .map((image) => image.publicId)
        .filter((publicId): publicId is string => Boolean(publicId));

      const [
        apiKeysDeleteResult,
        imagesDeleteResult,
        foldersDeleteResult,
        userDeleteResult,
      ] = await Promise.all([
        ApiKey.deleteMany({ userId }, { session }),
        Image.deleteMany({ userId }, { session }),
        Folder.deleteMany({ userId }, { session }),
        User.deleteOne({ _id: userId }, { session }),
      ]);

      if (userDeleteResult.deletedCount !== 1) {
        throw new ApiError(500, "Failed to delete user");
      }

      summary.deletedApiKeys = apiKeysDeleteResult.deletedCount ?? 0;
      summary.deletedImages = imagesDeleteResult.deletedCount ?? 0;
      summary.deletedFolders = foldersDeleteResult.deletedCount ?? 0;
    });
  } finally {
    await session.endSession();
  }

  const cloudinaryResults = await Promise.allSettled(
    imagePublicIds.map((publicId) => deleteFromCloudinary(publicId)),
  );

  const failedCloudinaryDeletes = cloudinaryResults.filter((result) => {
    if (result.status === "rejected") {
      return true;
    }

    const value = result.value as { result?: string } | null;
    return !value || (value.result !== "ok" && value.result !== "not found");
  }).length;

  return {
    ...summary,
    failedCloudinaryDeletes,
  };
};

export { deleteUserAccountService };
