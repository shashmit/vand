import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { supabaseAdmin } from "../lib/supabase";

type Variables = {
  user: any;
};

const uploadRoutes = new Hono<{ Variables: Variables }>();

uploadRoutes.use("*", authMiddleware);

uploadRoutes.post("/", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];
    const folderInput = body["folder"];

    if (!file || typeof file === "string") {
      return c.json({ error: "No file provided" }, 400);
    }

    const user = c.get("user");
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const rawFolder = typeof folderInput === "string" ? folderInput : "copilot";
    const safeFolder = rawFolder
      .split("/")
      .filter(Boolean)
      .map((segment) => segment.replace(/[^a-zA-Z0-9-_]/g, "_"))
      .join("/");
    const folder = safeFolder || "copilot";
    const fileName = `${folder}/${user.id}/${timestamp}_${safeName}`;
    const bucket = "rovy-images";

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase
    const { data, error } = await supabaseAdmin.storage.from(bucket).upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    });

    if (error) {
      console.error("Upload error:", error);
      return c.json({ error: "Upload failed", details: error.message }, 500);
    }

    // Get Public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);

    return c.json({ url: publicUrl });
  } catch (e) {
    console.error("Server upload error:", e);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default uploadRoutes;
