import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { ApiError } from "./api-error.js";
import { User } from "../models/user.model.js";
import { generateAccessAndRefreshToken } from "../controllers/auth.controller.js";

const handleRefreshToken = async (incomingRefreshToken: string) => {
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    refreshSecret,
  ) as JwtPayload;

  const user = await User.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh Token expired or used");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    String(user._id),
  );

  return { user, accessToken, refreshToken };
};

export default handleRefreshToken;
