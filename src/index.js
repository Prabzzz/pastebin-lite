// import dotenv from "dotenv";
// dotenv.config(); 

import express from "express";
import cors from "cors";

import healthRoute from "./routes/health.js";
import pasteRoutes from "./routes/pastes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/healthz", healthRoute);
app.use("/api/pastes", pasteRoutes);

import { getDB } from "./db/mongo.js";
import { getNow } from "./utils/time.js";

app.get("/", (req, res) => {
  res.status(200).send(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Pastebin Lite</title>
  </head>
  <body>
    <h2>Create a Paste</h2>

    <textarea id="content" rows="8" cols="60" placeholder="Paste your text here"></textarea>
    <br /><br />

    <input id="ttl" type="number" placeholder="TTL (seconds, optional)" />
    <br /><br />

    <input id="views" type="number" placeholder="Max views (optional)" />
    <br /><br />

    <button onclick="createPaste()">Create Paste</button>

    <p id="result"></p>

    <script>
      async function createPaste() {
        const content = document.getElementById("content").value;
        const ttl = document.getElementById("ttl").value;
        const views = document.getElementById("views").value;
        const result = document.getElementById("result");

        result.innerText = "";

        if (!content.trim()) {
          result.innerText = "Error: Content cannot be empty";
          return;
        }

        const body = { content };
        if (ttl) body.ttl_seconds = Number(ttl);
        if (views) body.max_views = Number(views);

        try {
          const res = await fetch("/api/pastes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });

          const data = await res.json();

          if (!res.ok) {
            result.innerText = "Error: " + (data.error || "Invalid input");
            return;
          }

          result.innerHTML =
            'Paste created: <a href="' + data.url + '">' + data.url + '</a>';
        } catch {
          result.innerText = "Network error";
        }
      }
    </script>
  </body>
</html>
  `);
});

app.get("/p/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    // Find paste
    const paste = await db.collection("pastes").findOne({ _id: id });

    if (!paste) {
      return res.status(404).send("Not Found");
    }

    const now = getNow(req);

    // Check expiry
    if (paste.expiresAt && now > paste.expiresAt.getTime()) {
      return res.status(404).send("Not Found");
    }

    // Check view limit
    if (paste.maxViews !== null && paste.views >= paste.maxViews) {
      return res.status(404).send("Not Found");
    }

    // Increment views
    await db.collection("pastes").updateOne(
      { _id: id },
      { $inc: { views: 1 } }
    );

    // Render safe HTML
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Paste ${id}</title>
        </head>
        <body>
          <pre>${paste.content}</pre>
        </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log("Server running on port", PORT);
// });

export default app;
