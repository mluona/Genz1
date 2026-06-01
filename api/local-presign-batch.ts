export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { files } = req.body;
    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ error: "Files array is required" });
    }

    const results = files.map((f: any) => {
      const cleanFilename = f.filename.replace(/[^a-zA-Z0-9./-]/g, '_');
      const safeFilename = `manga/${Date.now()}-${cleanFilename}`;
      const uploadUrl = `/api/upload-direct?filename=${encodeURIComponent(safeFilename)}`;
      const url = `/uploads/${safeFilename}`;
      return { uploadUrl, url, filename: f.filename };
    });

    res.status(200).json({ results });
  } catch (error: any) {
    console.error("[Local Presign Error] Batch build failed:", error.message);
    res.status(500).json({ error: "Failed to create local batch upload links" });
  }
}
