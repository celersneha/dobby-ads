import { randomUUID } from "node:crypto";
import type { Express, Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { getUserIdFromApiKey } from "./auth.js";
import {
  deleteSession,
  getSession,
  getSessionCount,
  setSession,
} from "./sessions.js";
import {
  writeJsonRpcError,
  toUnauthorizedOrServerStatus,
} from "./responses.js";
import { buildUserScopedMcpServer } from "./server.js";

const readSessionId = (req: Request): string | undefined => {
  const sessionIdHeader = req.headers["mcp-session-id"];
  return typeof sessionIdHeader === "string" ? sessionIdHeader : undefined;
};

const resolveOwnedSession = ({
  req,
  res,
  userId,
}: {
  req: Request;
  res: Response;
  userId: string;
}) => {
  const sessionId = readSessionId(req);
  if (!sessionId) {
    res.status(400).send("Missing mcp-session-id header");
    return;
  }

  const existing = getSession(sessionId);
  if (!existing) {
    res.status(400).send("Invalid or expired MCP session ID");
    return;
  }

  if (existing.userId !== userId) {
    res.status(403).send("Session does not belong to API key user");
    return;
  }

  return existing;
};

const handleExistingSessionJsonRpcRequest = async (
  req: Request,
  res: Response,
): Promise<boolean> => {
  const sessionId = readSessionId(req);
  if (!sessionId) {
    return false;
  }

  const userId = await getUserIdFromApiKey(req);
  const existing = getSession(sessionId);
  if (!existing) {
    writeJsonRpcError(res, 400, "Invalid or expired MCP session ID");
    return true;
  }

  if (existing.userId !== userId) {
    writeJsonRpcError(res, 403, "Session does not belong to API key user");
    return true;
  }

  await existing.transport.handleRequest(req, res, req.body);
  return true;
};

export const registerHostedMcpRoutes = (app: Express): void => {
  app.get("/mcp/health", (_req, res) => {
    res.status(200).json({ ok: true, sessions: getSessionCount() });
  });

  app.post("/mcp", async (req, res) => {
    try {
      const handledByExistingSession =
        await handleExistingSessionJsonRpcRequest(req, res);
      if (handledByExistingSession) {
        return;
      }

      const userId = await getUserIdFromApiKey(req);
      if (!isInitializeRequest(req.body)) {
        writeJsonRpcError(
          res,
          400,
          "No MCP session found. Send an initialize request first.",
        );
        return;
      }

      const server = buildUserScopedMcpServer({ userId });
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (generatedSessionId) => {
          setSession(generatedSessionId, {
            transport,
            server,
            userId,
          });
        },
      });

      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid) {
          deleteSession(sid);
        }

        void server.close();
      };

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      if (!res.headersSent) {
        writeJsonRpcError(
          res,
          toUnauthorizedOrServerStatus(error),
          error instanceof Error ? error.message : "Internal MCP server error",
        );
      }
    }
  });

  app.get("/mcp", async (req, res) => {
    try {
      const userId = await getUserIdFromApiKey(req);
      const existing = resolveOwnedSession({ req, res, userId });
      if (!existing) {
        return;
      }

      await existing.transport.handleRequest(req, res);
    } catch (error) {
      if (!res.headersSent) {
        res
          .status(toUnauthorizedOrServerStatus(error))
          .send(
            error instanceof Error
              ? error.message
              : "Internal MCP server error",
          );
      }
    }
  });

  app.delete("/mcp", async (req, res) => {
    try {
      const userId = await getUserIdFromApiKey(req);
      const existing = resolveOwnedSession({ req, res, userId });
      if (!existing) {
        return;
      }

      await existing.transport.handleRequest(req, res);
    } catch (error) {
      if (!res.headersSent) {
        res
          .status(toUnauthorizedOrServerStatus(error))
          .send(
            error instanceof Error
              ? error.message
              : "Internal MCP server error",
          );
      }
    }
  });
};
