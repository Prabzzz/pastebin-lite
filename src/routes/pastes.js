import { Router } from "express";
import { nanoid } from "nanoid";
import { getDB } from "../db/mongo.js";
import { getNow } from "../utils/time.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    // Validate content
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ error: "Content must be a non-empty string" });
    }

    // Validate ttl_seconds
    if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
      return res.status(400).json({ error: "ttl_seconds must be an integer >= 1" });
    }

    // Validate max_views
    if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
      return res.status(400).json({ error: "max_views must be an integer >= 1" });
    }

    const now = getNow(req);

    // Calculate expiry time
    const expiresAt = ttl_seconds
      ? new Date(now + ttl_seconds * 1000)
      : null;

    // Create paste object
    const paste = {
      _id: nanoid(10),
      content,
      createdAt: new Date(now),
      expiresAt,
      maxViews: max_views ?? null,
      views: 0
    };

    // Save to MongoDB
    const db = await getDB();
    await db.collection("pastes").insertOne(paste);

    const baseUrl =
      process.env.BASE_URL ||
      `${req.protocol}://${req.get("host")}`;

    // Return response
    res.status(201).json({
      id: paste._id,
      url: `${baseUrl}/p/${paste._id}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    // Find paste
    const paste = await db.collection("pastes").findOne({ _id: id });

    if (!paste) {
      return res.status(404).json({ error: "Not found" });
    }

    const now = getNow(req);

    // Check expiry
    if (paste.expiresAt && now > paste.expiresAt.getTime()) {
      return res.status(404).json({ error: "Expired" });
    }

    // Check view limit
    if (paste.maxViews !== null && paste.views >= paste.maxViews) {
      return res.status(404).json({ error: "View limit exceeded" });
    }

    // Increment views
    await db.collection("pastes").updateOne(
      { _id: id },
      { $inc: { views: 1 } }
    );

    // Calculate remaining views
    const remainingViews =
      paste.maxViews === null
        ? null
        : paste.maxViews - paste.views - 1;

    // Return response
    res.json({
      content: paste.content,
      remaining_views: remainingViews,
      expires_at: paste.expiresAt
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;