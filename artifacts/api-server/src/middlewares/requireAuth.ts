import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  dbUserId?: number;
  clerkId?: string;
}

// JIT provision: find or create a DB user for the Clerk session
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
    const displayName = clerkId.slice(0, 12);
    [user] = await db
      .insert(usersTable)
      .values({ clerkId, displayName, role: "fan" })
      .returning();
  }
  req.dbUserId = user.id;
  next();
}

// Optionally attach user if logged in, never 401
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  const clerkId = auth?.userId;
  if (clerkId) {
    req.clerkId = clerkId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
    if (user) req.dbUserId = user.id;
  }
  next();
}
