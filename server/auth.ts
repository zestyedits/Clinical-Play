import type { RequestHandler, Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "./supabase";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

export const ALLOWED_EMAILS = ["clinicalplayapp@gmail.com"];

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

  // 7-day free trial for new users
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  // Check if a user with this email exists under a different ID (e.g. Supabase project change)
  if (email) {
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing && existing.id !== supabaseUser.id) {
      // Update the existing record's ID to match the new Supabase auth ID
      await db.update(users).set({
        id: supabaseUser.id,
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        updatedAt: new Date(),
      }).where(eq(users.id, existing.id));
      const [updated] = await db.select().from(users).where(eq(users.id, supabaseUser.id));
      return updated;
    }
  }

  const [user] = await db
    .insert(users)
    .values({
      id: supabaseUser.id,
      email,
      firstName,
      lastName,
      trialEndsAt,
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

  // Step 1: Validate token with Supabase
  let user;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    user = data.user;
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Step 2: Check allowed emails
  const email = (user.email || "").toLowerCase();
  if (!ALLOWED_EMAILS.includes(email)) {
    return res.status(403).json({ message: "Access restricted. ClinicalPlay has not launched yet." });
  }

  // Step 3: Upsert user in DB (don't let this fail auth)
  try {
    await upsertUser(user);
  } catch (err) {
    console.error("[auth] upsertUser failed:", err);
    // Don't block auth if DB upsert fails — the user is still valid
  }

  req.authUser = {
    id: user.id,
    email,
    emailConfirmed: ALLOWED_EMAILS.includes(email) || !!user.email_confirmed_at,
  };

  return next();
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
