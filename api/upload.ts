import fs from "fs";
import path from "path";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { base64Data, filename } = req.body;
    if (!base64Data || !filename) {
      return res.status(400).json({ error: "Missing base64Data or filename" });
    }

    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    let buffer: Buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(base64Data, "base64");
    }

    const filePath = path.join(process.cwd(), "uploads", filename);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, buffer);

    console.log(`[Vercel Upload] POST saved to: ${filePath}`);
    res.status(200).json({ url: `/uploads/${filename}` });
  } catch (error: any) {
    console.error("[Vercel Upload Error] POST upload failed:", error.message);
    res.status(500).json({ error: "Upload failed: " + error.message });
  }
}
