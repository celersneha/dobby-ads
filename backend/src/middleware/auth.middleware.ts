import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import type { JwtPayload } from "../types/auth.types.js";
import {
  authCookieOptions,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import handleRefreshToken from "../utils/refresh-token.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.["AccessToken"] ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const accessSecret = process.env.ACCESS_TOKEN_SECRET!;
  let decodedToken: JwtPayload;

  try {
    decodedToken = jwt.verify(token, accessSecret) as JwtPayload;
  } catch (error: any) {
    // 🔥 Access token expired
    if (error.name === "TokenExpiredError") {
      const refreshToken = req.cookies?.["RefreshToken"];

      if (!refreshToken) {
        throw new ApiError(401, "Refresh token missing");
      }

      const {
        user,
        accessToken,
        refreshToken: newRefreshToken,
      } = await handleRefreshToken(refreshToken);

      // ✅ set new cookies
      res
        .cookie("AccessToken", accessToken, authCookieOptions)
        .cookie("RefreshToken", newRefreshToken, authCookieOptions);

      req.user = user;
      return next();
    }

    throw new ApiError(401, "Invalid access token");
  }

  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken",
  );

  if (!user) {
    throw new ApiError(401, "Invalid access token");
  }

  req.user = user;
  next();
});
