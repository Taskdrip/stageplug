import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import healthRouter from "./health";
import usersRouter from "./users";
import artistsRouter from "./artists";
import tracksRouter from "./tracks";
import eventsRouter from "./events";
import bookingsRouter from "./bookings";
import postsRouter from "./posts";
import competitionsRouter from "./competitions";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(artistsRouter);
router.use(tracksRouter);
router.use(eventsRouter);
router.use(bookingsRouter);
router.use(postsRouter);
router.use(competitionsRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(adminRouter);

export default router;
