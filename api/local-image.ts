import axios from "axios";
import path from "path";
import fs from "fs";

export default async function handler(req: any, res: any) {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).send("URL is required");
    }

    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      const cleanPath = url.replace(/^\//, '');
      const filePath = path.join(process.cwd(), cleanPath);
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'image/jpeg'); // default fallback
        return res.send(fs.readFileSync(filePath));
      } else {
        return res.status(404).send("File not found");
      }
    }

    // Proxy the remote link via axios
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(response.data);
  } catch (error: any) {
    console.error("[Local Proxy Error] Failed to proxy image request:", error.message);
    res.status(500).send("Failed to retrieve image: " + error.message);
  }
}
