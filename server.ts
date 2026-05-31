import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { initDb, executeQuery } from "./server-db";

puppeteer.use(StealthPlugin());

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Initialize highly persistent SQLite database schema and seed data
  initDb();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Dynamic parameterized SQLite Query Bridge handler
  app.post("/api/db", async (req, res) => {
    try {
      const {
        tableName,
        operation,
        filters = [],
        orderField = null,
        orderAscending = true,
        limitCount = null,
        isSingle = false,
        isMaybeSingle = false,
        data = null
      } = req.body;

      const result = await executeQuery(
        tableName,
        operation,
        filters,
        orderField,
        orderAscending,
        limitCount,
        isSingle,
        isMaybeSingle,
        data
      );
      res.json(result);
    } catch (err: any) {
      console.error("[SQLite Bridge REST Error]:", err);
      res.status(500).json({ data: null, error: { message: err.message || String(err) } });
    }
  });

  app.post("/api/proxy-image", async (req, res) => {
    const { url, referer, cookies } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    if (url.startsWith('data:image/')) {
      try {
        const matches = url.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return res.status(400).json({ error: "Invalid base64 image" });
        }
        const buffer = Buffer.from(matches[2], 'base64');
        res.set('Content-Type', `image/${matches[1]}`);
        res.set('Cache-Control', 'public, max-age=31536000');
        return res.send(buffer);
      } catch (error) {
        return res.status(500).json({ error: "Failed to parse base64 image" });
      }
    }
    
    try {
      const headers: any = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': (referer as string) || url,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      };

      if (cookies && typeof cookies === 'string') {
        headers['Cookie'] = cookies;
      }

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers
      });
      
      res.set('Content-Type', response.headers['content-type']);
      res.set('Cache-Control', 'public, max-age=31536000');
      res.send(response.data);
    } catch (error: any) {
      if (error.response && [403, 503].includes(error.response.status)) {
        console.log(`Axios failed with ${error.response.status} for ${url}, trying Puppeteer fallback...`);
        try {
          const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          });
          const page = await browser.newPage();
          
          const headers: any = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': (referer as string) || url,
          };
          await page.setExtraHTTPHeaders(headers);
          
          if (cookies && typeof cookies === 'string') {
            try {
              const urlObj = new URL(url);
              const cookieArray = cookies.split(';').map(c => {
                const [name, ...rest] = c.trim().split('=');
                return { name, value: rest.join('='), domain: urlObj.hostname };
              });
              await page.setCookie(...cookieArray);
            } catch (e) {
              console.error("Failed to parse cookies for Puppeteer:", e);
            }
          }
          
          const viewSource = await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
          if (!viewSource) throw new Error("No response from Puppeteer");
          
          const buffer = await viewSource.buffer();
          const contentType = viewSource.headers()['content-type'] || 'image/jpeg';
          await browser.close();
          
          res.set('Content-Type', contentType);
          res.set('Cache-Control', 'public, max-age=31536000');
          return res.send(buffer);
        } catch (puppeteerError: any) {
          console.error("Puppeteer fallback error:", puppeteerError.message);
        }
      }
      console.error("Proxy image error:", error.message);
      res.status(500).json({ error: "Failed to fetch image" });
    }
  });

  // Translation Proxy using Gemini API
  app.post("/api/translate", async (req, res) => {
    const { text, target } = req.body;
    if (!text || !target) {
      return res.status(400).json({ error: "Text and target language are required" });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following text to ${target}. Only return the translated text, nothing else.\n\nText: ${text}`,
      });
      
      res.json({ translatedText: response.text?.trim() || text });
    } catch (error: any) {
      console.error("Translation error:", error.message);
      res.status(500).json({ error: "Failed to translate text" });
    }
  });

  // Local File Uploads API (Absolute removal of Storj credentials and s3 SDK)
  // Direct binary PUT upload handler (used by XMLHttpRequest PUT)
  app.put("/api/upload-direct", express.raw({ type: "*/*", limit: "150mb" }), async (req, res) => {
    try {
      const filename = req.query.filename as string;
      if (!filename) {
        return res.status(400).send("Filename is required");
      }
      
      const filePath = path.join(process.cwd(), "uploads", filename);
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, req.body);
      
      console.log(`[Local Upload] Direct PUT saved to: ${filePath}`);
      res.status(200).send("OK");
    } catch (error: any) {
      console.error("[Local Upload Error] PUT direct upload failed:", error.message);
      res.status(500).send("Upload failed: " + error.message);
    }
  });

  // Base64 image POST upload
  app.post("/api/upload", async (req, res) => {
    try {
      const { base64Data, filename, contentType } = req.body;
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

      console.log(`[Local Upload] POST saved to: ${filePath}`);
      res.json({ url: `/uploads/${filename}` });
    } catch (error: any) {
      console.error("[Local Upload Error] POST upload failed:", error.message);
      res.status(500).json({ error: "Upload failed: " + error.message });
    }
  });

  // Local high-performance single presign
  app.post("/api/local-presign", async (req, res) => {
    try {
      const { filename, contentType } = req.body;
      if (!filename || !contentType) {
        return res.status(400).json({ error: "Filename and contentType are required" });
      }

      const cleanFilename = filename.replace(/[^a-zA-Z0-9./-]/g, '_');
      const safeFilename = `manga/${Date.now()}-${cleanFilename}`;
      const uploadUrl = `/api/upload-direct?filename=${encodeURIComponent(safeFilename)}`;
      const url = `/uploads/${safeFilename}`;

      res.json({ uploadUrl, url });
    } catch (error: any) {
      console.error("[Local Presign Error] Single build failed:", error.message);
      res.status(500).json({ error: "Failed to create local upload link" });
    }
  });

  // Local high-performance batch presign (for seamless admin chapter uploads)
  app.post("/api/local-presign-batch", async (req, res) => {
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

      res.json({ results });
    } catch (error: any) {
      console.error("[Local Presign Error] Batch build failed:", error.message);
      res.status(500).json({ error: "Failed to create local batch upload links" });
    }
  });

  // Local high-performance image proxy and static hoster
  app.get("/api/local-image", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).send("URL is required");
      }

      if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
        const cleanPath = url.replace(/^\//, '');
        return res.sendFile(path.join(process.cwd(), cleanPath));
      }

      // If it is a remote link, proxy it via axios as fallback
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=31536000');
      res.send(response.data);
    } catch (error: any) {
      console.error("[Local Proxy Error] Failed to proxy image request:", error.message);
      res.status(500).send("Failed to retrieve image: " + error.message);
    }
  });

  // Ensure uploads direct physical path is created
  try {
    fs.mkdirSync(path.join(process.cwd(), "uploads"), { recursive: true });
  } catch (err) {}

  // Static uploads serving
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
