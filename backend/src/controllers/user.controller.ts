import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { deleteUserAccountService } from "../services/user.service.js";
import { authCookieOptions } from "./auth.controller.js";

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const deleteCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const result = await deleteUserAccountService({
    userId: String(userId),
  });

  return res
    .status(200)
    .clearCookie("AccessToken", authCookieOptions)
    .clearCookie("RefreshToken", authCookieOptions)
    .json(new ApiResponse(200, result, "User account deleted successfully"));
});

export { deleteCurrentUser, getCurrentUser };
