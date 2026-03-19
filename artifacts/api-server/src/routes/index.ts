import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eventsRouter from "./events";
import ticketsRouter from "./tickets";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eventsRouter);
router.use(ticketsRouter);
router.use(ordersRouter);
router.use(paymentsRouter);
router.use(adminRouter);

export default router;
