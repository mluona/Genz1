import fs from "fs";
import path from "path";

// Set body size limits to handle large file sizes correctly if needed in parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== "PUT") {
    return res.status(405).send("Method not allowed");
  }

  try {
    const { filename } = req.query;
    if (!filename || typeof filename !== "string") {
      return res.status(400).send("Filename is required");
    }

    const filePath = path.join(process.cwd(), "uploads", filename);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

    // Read full raw stream body
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    await fs.promises.writeFile(filePath, buffer);
    console.log(`[Vercel Upload] Direct PUT saved to: ${filePath}`);
    res.status(200).send("OK");
  } catch (error: any) {
    console.error("[Vercel Upload Error] PUT direct upload failed:", error.message);
    res.status(500).send("Upload failed: " + error.message);
  }
}
