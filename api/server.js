/**
 * Vercel Serverless entry for the Express app (serverless-http bundle).
 * Use .js (ESM) here: Vercel only matches `functions` patterns against standard
 * api/*.js / api/*.ts entrypoints — `api/server.cjs` is not recognized.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const bundled = require("../dist/vercel-handler.cjs");
const handler = typeof bundled === "function" ? bundled : bundled.default;
if (typeof handler !== "function") {
  throw new Error(
    "dist/vercel-handler.cjs must export a default function; run npm run build before deploy.",
  );
}
export default handler;
