import { Router, type IRouter } from "express";
import { db, scholarshipsTable } from "@workspace/db";
import { ListScholarshipsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/scholarships", async (_req, res): Promise<void> => {
  const scholarships = await db.select().from(scholarshipsTable);
  res.json(ListScholarshipsResponse.parse(scholarships));
});

export default router;
