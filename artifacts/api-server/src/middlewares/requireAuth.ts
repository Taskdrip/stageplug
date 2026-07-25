import { getAuth, clerkClient } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  dbUserId?: number;
  dbUserRole?: string;
  clerkId?: string;
}

/**
 * JIT provision: resolve Clerk session → find or create a matching DB user.
 * On first sign-in, pulls the user's real name + avatar from Clerk API.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  const clerkId = auth?.userId;
  if (!clerkId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.clerkId = clerkId;

  let [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));

  if (!user) {
    // Pull real name + avatar from Clerk so the new user has a proper profile
    let displayName = clerkId.slice(0, 12);
    let avatarUrl: string | null = null;
    try {
      const clerkUser = await clerkClient().users.getUser(clerkId);
      const full = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
      displayName = full || clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] || displayName;
      avatarUrl = clerkUser.imageUrl ?? null;
    } catch {
      // Non-fatal — fall back to clerkId prefix
    }

    [user] = await db
      .insert(usersTable)
      .values({ clerkId, displayName, avatarUrl, role: "fan" })
      .returning();
  }

  req.dbUserId = user.id;
  req.dbUserRole = user.role;
  next();
}

/**
 * Optionally attach user if a Clerk session exists — never returns 401.
 * Also JIT-provisions the DB user if missing.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  const clerkId = auth?.userId;
  if (clerkId) {
    req.clerkId = clerkId;
    let [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
    if (!user) {
      // JIT provision same as requireAuth
      let displayName = clerkId.slice(0, 12);
      let avatarUrl: string | null = null;
      try {
        const clerkUser = await clerkClient().users.getUser(clerkId);
        const full = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
        displayName = full || clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] || displayName;
        avatarUrl = clerkUser.imageUrl ?? null;
      } catch {
        // Non-fatal
      }
      [user] = await db.insert(usersTable).values({ clerkId, displayName, avatarUrl, role: "fan" }).returning();
    }
    if (user) {
      req.dbUserId = user.id;
      req.dbUserRole = user.role;
    }
  }
  next();
}
