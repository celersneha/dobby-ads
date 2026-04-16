import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface UserMethods {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export interface UserDocument {
  email: string;
  Name: string;
  password: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<
  UserDocument,
  mongoose.Model<UserDocument, {}, UserMethods>,
  UserMethods
>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    Name: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not configured");
  }

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      Name: this.Name,
    },
    secret,
    {
      expiresIn: (process.env.ACCESS_TOKEN_EXPIRY ??
        "15m") as jwt.SignOptions["expiresIn"],
    },
  );
};
userSchema.methods.generateRefreshToken = function () {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET is not configured");
  }

  return jwt.sign(
    {
      _id: this._id,
    },
    secret,
    {
      expiresIn: (process.env.REFRESH_TOKEN_EXPIRY ??
        "7d") as jwt.SignOptions["expiresIn"],
    },
  );
};

export const User =
  (mongoose.models.User as mongoose.Model<UserDocument, {}, UserMethods>) ||
  mongoose.model<UserDocument, mongoose.Model<UserDocument, {}, UserMethods>>(
    "User",
    userSchema,
  );
