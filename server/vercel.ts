import serverless from "serverless-http";
import { createApplication } from "./createApp";

let cached: ReturnType<typeof serverless> | null = null;

export default async function handler(req: unknown, res: unknown) {
  if (!cached) {
    const { app } = await createApplication();
    cached = serverless(app);
  }
  return cached(req, res);
}
