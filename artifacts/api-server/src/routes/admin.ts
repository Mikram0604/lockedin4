import { Router, type IRouter } from "express";
import { runSilenceDetector } from "../lib/silenceDetector";

const router: IRouter = Router();

/**
 * POST /api/admin/run-silence-detector
 * Manually triggers the silence detector (useful for testing and demos).
 */
router.post("/admin/run-silence-detector", async (req, res) => {
  try {
    const result = await runSilenceDetector();
    res.json({ ok: true, ...result });
  } catch (err) {
    req.log.error({ err }, "Manual silence detector run failed");
    res.status(500).json({ ok: false, error: "Silence detector failed" });
  }
});

export default router;
