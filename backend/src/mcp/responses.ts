import type { Response } from "express";

export const writeJsonRpcError = (
  res: Response,
  statusCode: number,
  message: string,
): void => {
  res.status(statusCode).json({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message,
    },
    id: null,
  });
};

export const toUnauthorizedOrServerStatus = (error: unknown): number => {
  return error instanceof Error &&
    error.message.toLowerCase().startsWith("unauthorized")
    ? 401
    : 500;
};
