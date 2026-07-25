import { Router, type IRouter } from "express";
import { eq, sql, desc, asc } from "drizzle-orm";
import { db, postsTable, postLikesTable, commentsTable, usersTable } from "@workspace/db";
import { requireAuth, optionalAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

// GET /posts
router.get("/posts", optionalAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const { page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 50);
  const offset = (pageNum - 1) * limitNum;

  const rows = await db.select().from(postsTable)
    .leftJoin(usersTable, eq(postsTable.authorId, usersTable.id))
    .orderBy(desc(postsTable.createdAt))
    .limit(limitNum).offset(offset);

  const result = await Promise.all(rows.map(async ({ posts: p, users: u }) => {
    let likedByMe = false;
    if (req.dbUserId) {
      const [like] = await db.select().from(postLikesTable)
        .where(eq(postLikesTable.postId, p.id));
      likedByMe = !!like;
    }
    return {
      id: p.id, authorId: p.authorId, authorName: u?.displayName || "User",
      authorAvatarUrl: u?.avatarUrl || null, authorRole: u?.role || "fan",
      content: p.content, mediaUrl: p.mediaUrl, mediaType: p.mediaType,
      postType: p.postType, likes: p.likes, likedByMe,
      commentsCount: p.commentsCount, createdAt: p.createdAt.toISOString(),
    };
  }));

  res.json(result);
});

// POST /posts
router.post("/posts", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const { content, postType, mediaUrl, mediaType } = req.body;
  if (!content || !postType) { res.status(400).json({ error: "Content and postType required" }); return; }

  const [post] = await db.insert(postsTable).values({
    authorId: req.dbUserId!, content, postType: postType || "text", mediaUrl, mediaType,
  }).returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.dbUserId!));

  // Award XP
  await db.update(usersTable).set({ xp: sql`${usersTable.xp} + 10` }).where(eq(usersTable.id, req.dbUserId!));

  res.status(201).json({
    id: post.id, authorId: post.authorId, authorName: user.displayName,
    authorAvatarUrl: user.avatarUrl, authorRole: user.role,
    content: post.content, mediaUrl: post.mediaUrl, mediaType: post.mediaType,
    postType: post.postType, likes: 0, likedByMe: false,
    commentsCount: 0, createdAt: post.createdAt.toISOString(),
  });
});

// POST /posts/:postId/like
router.post("/posts/:postId/like", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const postId = parseInt(Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId, 10);
  const [existing] = await db.select().from(postLikesTable)
    .where(eq(postLikesTable.postId, postId));

  let liked: boolean;
  let [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));

  if (existing) {
    await db.delete(postLikesTable).where(eq(postLikesTable.id, existing.id));
    [post] = await db.update(postsTable).set({ likes: Math.max(0, post.likes - 1) }).where(eq(postsTable.id, postId)).returning();
    liked = false;
  } else {
    await db.insert(postLikesTable).values({ postId, userId: req.dbUserId! });
    [post] = await db.update(postsTable).set({ likes: post.likes + 1 }).where(eq(postsTable.id, postId)).returning();
    liked = true;
  }

  res.json({ liked, likes: post.likes });
});

// GET /posts/:postId/comments
router.get("/posts/:postId/comments", async (req, res): Promise<void> => {
  const postId = parseInt(Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId, 10);
  const rows = await db.select().from(commentsTable)
    .leftJoin(usersTable, eq(commentsTable.authorId, usersTable.id))
    .where(eq(commentsTable.postId, postId))
    .orderBy(asc(commentsTable.createdAt));

  res.json(rows.map(({ comments: c, users: u }) => ({
    id: c.id, postId: c.postId, authorId: c.authorId,
    authorName: u?.displayName || "User", authorAvatarUrl: u?.avatarUrl || null,
    content: c.content, createdAt: c.createdAt.toISOString(),
  })));
});

// POST /posts/:postId/comments
router.post("/posts/:postId/comments", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const postId = parseInt(Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId, 10);
  const { content } = req.body;
  if (!content) { res.status(400).json({ error: "Content required" }); return; }

  const [comment] = await db.insert(commentsTable).values({
    postId, authorId: req.dbUserId!, content,
  }).returning();

  // Update commentsCount
  await db.update(postsTable).set({ commentsCount: sql`${postsTable.commentsCount} + 1` }).where(eq(postsTable.id, postId));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.dbUserId!));
  res.status(201).json({
    id: comment.id, postId: comment.postId, authorId: comment.authorId,
    authorName: user.displayName, authorAvatarUrl: user.avatarUrl,
    content: comment.content, createdAt: comment.createdAt.toISOString(),
  });
});

export default router;
