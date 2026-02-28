import type { RequestHandler, Request, Response, NextFunction } from "express";
import { appendFileSync } from "fs";
import { join } from "path";
import { supabaseAdmin } from "./supabase";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

// Include Gmail dot-alias: clinical.play.app@ and clinicalplayapp@ deliver to same inbox
const ALLOWED_EMAILS = ["clinicalplayapp@gmail.com", "clinical.play.app@gmail.com"];

export interface AuthUser {
  id: string;
  email: string;
  emailConfirmed: boolean;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

async function upsertUser(supabaseUser: { id: string; email?: string; user_metadata?: any }) {
  const email = supabaseUser.email || "";
  const firstName = supabaseUser.user_metadata?.first_name || supabaseUser.user_metadata?.firstName || null;
  const lastName = supabaseUser.user_metadata?.last_name || supabaseUser.user_metadata?.lastName || null;

  const [user] = await db
    .insert(users)
    .values({
      id: supabaseUser.id,
      email,
      firstName,
      lastName,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email,
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
}

export const isAuthenticated: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const email = (user.email || "").toLowerCase();
    if (!ALLOWED_EMAILS.includes(email)) {
      // #region agent log
      const logData = { sessionId: "548a0c", location: "auth.ts:403", message: "403 Access restricted", data: { email, allowed: ALLOWED_EMAILS }, timestamp: Date.now(), hypothesisId: "H2" };
      try { appendFileSync(join(process.cwd(), "debug-548a0c.log"), JSON.stringify(logData) + "\n"); } catch {}
      console.warn("[auth] 403:", logData);
      // #endregion
      return res.status(403).json({ message: "Access restricted. ClinicalPlay has not launched yet." });
    }

    await upsertUser(user);

    req.authUser = {
      id: user.id,
      email,
      // Treat allowed (admin) emails as always confirmed so they don't get stuck
      emailConfirmed: ALLOWED_EMAILS.includes(email) || !!user.email_confirmed_at,
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    const email = (user.email || "").toLowerCase();
    return {
      id: user.id,
      email,
      emailConfirmed: ALLOWED_EMAILS.includes(email) || !!user.email_confirmed_at,
    };
  } catch {
    return null;
  }
}
