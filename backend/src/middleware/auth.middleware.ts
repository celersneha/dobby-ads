import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import type { JwtPayload } from "../types/auth.types.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.["AccessToken"] ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const accessSecret = process.env.ACCESS_TOKEN_SECRET;
    if (!accessSecret) {
      throw new ApiError(500, "ACCESS_TOKEN_SECRET is not configured");
    }

    const decodedToken = jwt.verify(token, accessSecret) as JwtPayload;
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, (error as Error).message || "Invalid access token");
  }
});
