import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studentsRouter from "./students";
import riskFlagsRouter from "./risk_flags";
import scholarshipsRouter from "./scholarships";
import dashboardRouter from "./dashboard";
import webhookRouter from "./webhook";
import adminRouter from "./admin";
import webChatRouter from "./webChat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studentsRouter);
router.use(riskFlagsRouter);
router.use(scholarshipsRouter);
router.use(dashboardRouter);
router.use(webhookRouter);
router.use(adminRouter);
router.use(webChatRouter);

export default router;
