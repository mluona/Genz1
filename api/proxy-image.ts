import axios from "axios";

export default async function handler(req: any, res: any) {
  const { url, referer, cookies } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  if (url.startsWith("data:image/")) {
    try {
      const matches = url.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid base64 image" });
      }
      const buffer = Buffer.from(matches[2], "base64");
      res.setHeader("Content-Type", `image/${matches[1]}`);
      res.setHeader("Cache-Control", "public, max-age=31536000");
      return res.send(buffer);
    } catch (error) {
      return res.status(500).json({ error: "Failed to parse base64 image" });
    }
  }

  try {
    const headers: any = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Referer: (referer as string) || url,
      Accept:
        "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    };

    if (cookies && typeof cookies === "string") {
      headers["Cookie"] = cookies;
    }

    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers,
    });

    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.send(response.data);
  } catch (error: any) {
    console.error("Proxy image error:", error.message);
    res.status(500).json({ error: "Failed to fetch image" });
  }
}
