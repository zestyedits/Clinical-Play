/**
 * Vercel Serverless entry for the Express app (serverless-http bundle).
 * PATTERN: Legacy vercel.json "builds" + "routes" are often ignored when the
 * project is linked as Vite; a file under /api is always deployed as a function.
 */
"use strict";

const bundled = require("../dist/vercel-handler.cjs");
const handler = typeof bundled === "function" ? bundled : bundled.default;
if (typeof handler !== "function") {
  throw new Error(
    "dist/vercel-handler.cjs must export a default function; run npm run build before deploy.",
  );
}
module.exports = handler;
