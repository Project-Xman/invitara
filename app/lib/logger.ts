/**
 * Structured logger. Writes JSON lines to stdout in production.
 * In dev, pretty colored output for readability.
 * Drop-in for `console` with extra `child()` and contextual fields.
 */

import { env } from "./env";

type Level = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const MIN_LEVEL_RANK = LEVEL_RANK[(process.env.LOG_LEVEL as Level) ?? (env.isProd ? "info" : "debug")];

interface LogFields {
  [k: string]: unknown;
}

function serialize(level: Level, msg: string, fields: LogFields): string {
  return JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    env: env.NODE_ENV,
    ...fields,
  });
}

function prettify(level: Level, msg: string, fields: LogFields): string {
  const color =
    level === "error" ? "\x1b[31m" : level === "warn" ? "\x1b[33m" : level === "debug" ? "\x1b[90m" : "\x1b[36m";
  const reset = "\x1b[0m";
  const fieldsStr = Object.keys(fields).length ? ` ${JSON.stringify(fields)}` : "";
  return `${color}[${level.toUpperCase()}]${reset} ${msg}${fieldsStr}`;
}

function emit(level: Level, msg: string, fields: LogFields = {}) {
  if (LEVEL_RANK[level] < MIN_LEVEL_RANK) return;
  const line = env.isProd ? serialize(level, msg, fields) : prettify(level, msg, fields);
  const stream = level === "error" || level === "warn" ? process.stderr : process.stdout;
  stream.write(line + "\n");
}

export interface Logger {
  debug: (msg: string, fields?: LogFields) => void;
  info: (msg: string, fields?: LogFields) => void;
  warn: (msg: string, fields?: LogFields) => void;
  error: (msg: string, fields?: LogFields) => void;
  child: (ctx: LogFields) => Logger;
}

function build(ctx: LogFields = {}): Logger {
  return {
    debug: (msg, fields = {}) => emit("debug", msg, { ...ctx, ...fields }),
    info: (msg, fields = {}) => emit("info", msg, { ...ctx, ...fields }),
    warn: (msg, fields = {}) => emit("warn", msg, { ...ctx, ...fields }),
    error: (msg, fields = {}) => emit("error", msg, { ...ctx, ...fields }),
    child: (extra) => build({ ...ctx, ...extra }),
  };
}

export const log = build();
