import { Router, type IRouter } from "express";
import { buildTwiML } from "../lib/twilio";
import { processIncomingMessage } from "../lib/botCore";

const router: IRouter = Router();

router.post("/webhook/twilio", async (req, res): Promise<void> => {
  res.setHeader("Content-Type", "text/xml");

  const from: string = req.body?.From ?? "";
  const body: string = req.body?.Body ?? "";

  if (!from) {
    res.status(200).send(buildTwiML("Sorry, we couldn't identify your number."));
    return;
  }

  try {
    const responseText = await processIncomingMessage(from, body);
    res.status(200).send(buildTwiML(responseText));
  } catch (err) {
    req.log.error({ err }, "Error processing Twilio message");
    res.status(500).send(buildTwiML("Sorry, an internal error occurred."));
  }
});

export default router;
