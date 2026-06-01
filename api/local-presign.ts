export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
      return res.status(400).json({ error: "Filename and contentType are required" });
    }

    const cleanFilename = filename.replace(/[^a-zA-Z0-9./-]/g, '_');
    const safeFilename = `manga/${Date.now()}-${cleanFilename}`;
    const uploadUrl = `/api/upload-direct?filename=${encodeURIComponent(safeFilename)}`;
    const url = `/uploads/${safeFilename}`;

    res.status(200).json({ uploadUrl, url });
  } catch (error: any) {
    console.error("[Local Presign Error] Single build failed:", error.message);
    res.status(500).json({ error: "Failed to create local upload link" });
  }
}
