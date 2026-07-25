import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

function formatNotification(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id, userId: n.userId, type: n.type, title: n.title,
    message: n.message, read: n.read === 1, referenceId: n.referenceId,
    referenceType: n.referenceType, createdAt: n.createdAt.toISOString(),
  };
}

// GET /notifications
router.get("/notifications", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const notifications = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, req.dbUserId!))
    .orderBy(sql`${notificationsTable.created_at} desc`)
    .limit(50);
  res.json(notifications.map(formatNotification));
});

// POST /notifications/read-all
router.post("/notifications/read-all", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const result = await db.update(notificationsTable)
    .set({ read: 1 })
    .where(eq(notificationsTable.userId, req.dbUserId!))
    .returning();
  res.json({ count: result.length });
});

// PATCH /notifications/:notificationId/read
router.patch("/notifications/:notificationId/read", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const notificationId = parseInt(Array.isArray(req.params.notificationId) ? req.params.notificationId[0] : req.params.notificationId, 10);
  const [notification] = await db.update(notificationsTable).set({ read: 1 }).where(eq(notificationsTable.id, notificationId)).returning();
  if (!notification) { res.status(404).json({ error: "Notification not found" }); return; }
  res.json(formatNotification(notification));
});

export default router;
