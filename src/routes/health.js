import { Router } from "express";
import { getDB } from "../db/mongo.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    await getDB();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

export default router;
