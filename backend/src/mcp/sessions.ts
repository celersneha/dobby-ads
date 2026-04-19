import type { SessionEntry } from "./types.js";

const sessions = new Map<string, SessionEntry>();

export const getSessionCount = (): number => sessions.size;

export const getSession = (sessionId: string): SessionEntry | undefined =>
  sessions.get(sessionId);

export const setSession = (sessionId: string, session: SessionEntry): void => {
  sessions.set(sessionId, session);
};

export const deleteSession = (sessionId: string): void => {
  sessions.delete(sessionId);
};
