import express from "express";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import crypto from "crypto";
import { initDb, executeQuery } from "./server-db";

puppeteer.use(StealthPlugin());

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Secure Password Hashing & Verification via Node.js Native PBKDF2
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === verifyHash;
}

async function startServer() {
  // Initialize highly persistent SQLite database schema and seed data
  await initDb();

  const app = express();
  const PORT = 3000;

  // Add gzip compression for faster responses
  app.use(compression());

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ==========================================
  // REAL FULL-STACK SECURE AUTHENTICATION ENDPOINTS
  // ==========================================

  // 1. Email Sign Up Endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, username } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان!" });
      }

      // Check if user already exists
      const checkRes = await executeQuery("profiles", "select", [{ field: "email", op: "=", val: email }]);
      if (checkRes.data && checkRes.data.length > 0) {
        return res.status(400).json({ error: "البريد الإلكتروني مسجل بالفعل!" });
      }

      const userId = "usr_" + Math.random().toString(36).substring(2, 11);
      const passHash = hashPassword(password);
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;

      const defaultProfile = {
        id: userId,
        uid: userId,
        username: username || email.split("@")[0],
        email,
        bio: "Reading is life.",
        profilePicture: avatarUrl,
        role: (email === "aynmluona@gmail.com" || email === "genz-manga@gmail.com") ? "admin" : "user",
        favorites: [],
        history: [],
        bookmarks: [],
        banned: 0,
        coins: 1000,
        password_hash: passHash
      };

      const result = await executeQuery("profiles", "insert", [], null, true, null, false, false, defaultProfile);
      if (result.error) {
        throw new Error(result.error.message);
      }

      const user = {
        id: userId,
        uid: userId,
        email,
        user_metadata: {
          full_name: defaultProfile.username,
          avatar_url: defaultProfile.profilePicture
        },
        created_at: new Date().toISOString()
      };

      res.json({ user });
    } catch (err: any) {
      console.error("[Auth Signup Error]:", err);
      res.status(500).json({ error: err.message || "فشلت عملية إنشاء الحساب." });
    }
  });

  // 2. Email Sign In Endpoint
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان!" });
      }

      const checkRes = await executeQuery("profiles", "select", [{ field: "email", op: "=", val: email }]);
      const profile = checkRes.data && checkRes.data.length > 0 ? checkRes.data[0] : null;

      if (!profile || !profile.password_hash) {
        return res.status(400).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة!" });
      }

      const isMatch = verifyPassword(password, profile.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة!" });
      }

      if (profile.banned) {
        return res.status(403).json({ error: "الحساب الخاص بك محظور!" });
      }

      const user = {
        id: profile.id,
        uid: profile.uid,
        email: profile.email,
        user_metadata: {
          full_name: profile.username,
          avatar_url: profile.profilePicture
        },
        created_at: new Date().toISOString()
      };

      res.json({ user });
    } catch (err: any) {
      console.error("[Auth Signin Error]:", err);
      res.status(500).json({ error: err.message || "فشلت عملية تسجيل الدخول." });
    }
  });

  // 3. Construct OAuth dynamic Provider URLs
  app.get("/api/auth/url", (req, res) => {
    const { provider, redirect_uri } = req.query;
    if (!provider || typeof provider !== "string") {
      return res.status(400).json({ error: "Provider is required" });
    }
    if (!redirect_uri || typeof redirect_uri !== "string") {
      return res.status(400).json({ error: "redirect_uri is required" });
    }

    if (provider === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        return res.json({ error_missing_env: "GOOGLE_CLIENT_ID" });
      }
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirect_uri,
        response_type: "code",
        scope: "openid email profile",
        prompt: "select_account"
      });
      return res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
    }

    if (provider === "discord") {
      const clientId = process.env.DISCORD_CLIENT_ID;
      if (!clientId) {
        return res.json({ error_missing_env: "DISCORD_CLIENT_ID" });
      }
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirect_uri,
        response_type: "code",
        scope: "identify email"
      });
      return res.json({ url: `https://discord.com/api/oauth2/authorize?${params.toString()}` });
    }

    return res.status(400).json({ error: "Unsupported provider" });
  });

  // 4. Google OAuth Redirect Callback Endpoint
  app.get(["/api/auth/callback/google", "/api/auth/callback/google/"], async (req, res) => {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 2rem; background: #121214; color: #fff;">
            <p style="color: #ef4444; font-weight: bold; font-size: 1.2rem;">خطأ في تسجيل الدخول</p>
            <p style="color: #a1a1aa;">كود المصادقة مفقود أو غير صالح.</p>
            <script>setTimeout(() => window.close(), 5000);</script>
          </body>
        </html>
      `);
    }

    try {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
      if (!googleClientId || !googleClientSecret) {
        throw new Error("الرجاء تحديد GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET في إعدادات البيئة بـ AI Studio لإكمال إعداد جوجل.");
      }

      // Reconstruct the exact redirect URI used by client
      const host = req.headers.host || "localhost:3000";
      const protocol = req.headers["x-forwarded-proto"] || "http";
      const redirectUri = `${protocol}://${host}/api/auth/callback/google`;

      // Token exchange
      const tokenRes = await axios.post("https://oauth2.googleapis.com/token", new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      }).toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      const { access_token } = tokenRes.data;

      // Profile fetch
      const userRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const { id: googleId, email, name, picture } = userRes.data;

      if (!email) {
        throw new Error("تعذر الحصول على البريد الإلكتروني من حساب جوجل الخاص بك.");
      }

      // Check user in database by google_id first, then by email
      let profileResult = await executeQuery("profiles", "select", [{ field: "google_id", op: "=", val: googleId }]);
      let profile = profileResult.data && profileResult.data.length > 0 ? profileResult.data[0] : null;

      if (!profile) {
        // Fallback search by email
        profileResult = await executeQuery("profiles", "select", [{ field: "email", op: "=", val: email }]);
        profile = profileResult.data && profileResult.data.length > 0 ? profileResult.data[0] : null;
      }

      const userId = profile ? profile.id : "usr_" + Math.random().toString(36).substring(2, 11);
      const defaultProfile = {
        id: userId,
        uid: userId,
        username: profile?.username || name || email.split("@")[0],
        email,
        bio: profile?.bio || "Reading is life.",
        profilePicture: profile?.profilePicture || picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        role: profile?.role || ((email === "aynmluona@gmail.com" || email === "genz-manga@gmail.com") ? "admin" : "user"),
        favorites: profile?.favorites || [],
        history: profile?.history || [],
        bookmarks: profile?.bookmarks || [],
        banned: profile?.banned ? 1 : 0,
        coins: profile?.coins !== undefined ? profile.coins : 1000,
        google_id: googleId
      };

      // Upsert to DB
      await executeQuery("profiles", "insert", [], null, true, null, false, false, defaultProfile);

      if (defaultProfile.banned) {
        throw new Error("عذراً، هذا الحساب محظور.");
      }

      const user = {
        id: userId,
        uid: userId,
        email,
        user_metadata: {
          full_name: defaultProfile.username,
          avatar_url: defaultProfile.profilePicture
        },
        created_at: new Date().toISOString()
      };

      // Send to callback parent
      return res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 2rem; background: #121214; color: #fff;">
            <p style="color: #10b981; font-weight: bold; font-size: 1.2rem;">تم تسجيل الدخول بنجاح!</p>
            <p style="color: #a1a1aa;">يرجى الانتظار، يتم الآن إغلاق النافذة والعودة إلى التطبيق تلقائياً...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*');
                window.close();
              } else {
                localStorage.setItem("session_user", '${JSON.stringify(user)}');
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("[Google OAuth Callback Error]:", err);
      const errorMsg = err.response?.data?.error_description || err.message || "حدث خطأ غير معروف";
      return res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 2rem; background: #121214; color: #fff;">
            <p style="color: #ef4444; font-weight: bold; font-size: 1.2rem;">فشل تسجيل الدخول من خلال جوجل</p>
            <p style="color: #a1a1aa; margin-bottom: 1.5rem;">${errorMsg}</p>
            <button onclick="window.close()" style="background: #10b981; color: #000; font-weight: bold; border: none; padding: 0.6rem 1.2rem; border-radius: 0.5rem; cursor: pointer;">إغلاق النافذة</button>
          </body>
        </html>
      `);
    }
  });

  // 5. Discord OAuth Redirect Callback Endpoint
  app.get(["/api/auth/callback/discord", "/api/auth/callback/discord/"], async (req, res) => {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 2rem; background: #121214; color: #fff;">
            <p style="color: #ef4444; font-weight: bold; font-size: 1.2rem;">خطأ في تسجيل الدخول</p>
            <p style="color: #a1a1aa;">كود المصادقة مفقود أو غير صالح.</p>
            <script>setTimeout(() => window.close(), 5000);</script>
          </body>
        </html>
      `);
    }

    try {
      const discordClientId = process.env.DISCORD_CLIENT_ID;
      const discordClientSecret = process.env.DISCORD_CLIENT_SECRET;
      
      if (!discordClientId || !discordClientSecret) {
        throw new Error("الرجاء تحديد DISCORD_CLIENT_ID و DISCORD_CLIENT_SECRET في إعدادات البيئة بـ AI Studio لإكمال إعداد ديسكورد.");
      }

      // Reconstruct the exact redirect URI used by client
      const host = req.headers.host || "localhost:3000";
      const protocol = req.headers["x-forwarded-proto"] || "http";
      const redirectUri = `${protocol}://${host}/api/auth/callback/discord`;

      // Token exchange
      const tokenRes = await axios.post("https://discord.com/api/oauth2/token", new URLSearchParams({
        code,
        client_id: discordClientId,
        client_secret: discordClientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      }).toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      const { access_token } = tokenRes.data;

      // Profile fetch
      const userRes = await axios.get("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const { id: discordId, username, email, avatar } = userRes.data;

      if (!email) {
        throw new Error("تعذر الحصول على البريد الإلكتروني من حساب ديسكورد الخاص بك.");
      }

      // Avatar construction
      const avatarUrl = avatar 
        ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png` 
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${discordId}`;

      // Check user in database by discord_id first, then by email
      let profileResult = await executeQuery("profiles", "select", [{ field: "discord_id", op: "=", val: discordId }]);
      let profile = profileResult.data && profileResult.data.length > 0 ? profileResult.data[0] : null;

      if (!profile) {
        profileResult = await executeQuery("profiles", "select", [{ field: "email", op: "=", val: email }]);
        profile = profileResult.data && profileResult.data.length > 0 ? profileResult.data[0] : null;
      }

      const userId = profile ? profile.id : "usr_" + Math.random().toString(36).substring(2, 11);
      const defaultProfile = {
        id: userId,
        uid: userId,
        username: profile?.username || username || email.split("@")[0],
        email,
        bio: profile?.bio || "Reading is life.",
        profilePicture: profile?.profilePicture || avatarUrl,
        role: profile?.role || ((email === "aynmluona@gmail.com" || email === "genz-manga@gmail.com") ? "admin" : "user"),
        favorites: profile?.favorites || [],
        history: profile?.history || [],
        bookmarks: profile?.bookmarks || [],
        banned: profile?.banned ? 1 : 0,
        coins: profile?.coins !== undefined ? profile.coins : 1000,
        discord_id: discordId
      };

      // Upsert to DB
      await executeQuery("profiles", "insert", [], null, true, null, false, false, defaultProfile);

      if (defaultProfile.banned) {
        throw new Error("عذراً، هذا الحساب محظور.");
      }

      const user = {
        id: userId,
        uid: userId,
        email,
        user_metadata: {
          full_name: defaultProfile.username,
          avatar_url: defaultProfile.profilePicture
        },
        created_at: new Date().toISOString()
      };

      // Send to callback parent
      return res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 2rem; background: #121214; color: #fff;">
            <p style="color: #10b981; font-weight: bold; font-size: 1.2rem;">تم تسجيل الدخول بنجاح!</p>
            <p style="color: #a1a1aa;">يرجى الانتظار، يتم الآن إغلاق النافذة والعودة إلى التطبيق تلقائياً...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*');
                window.close();
              } else {
                localStorage.setItem("session_user", '${JSON.stringify(user)}');
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("[Discord OAuth Callback Error]:", err);
      const errorMsg = err.response?.data?.error_description || err.message || "حدث خطأ غير معروف";
      return res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 2rem; background: #121214; color: #fff;">
            <p style="color: #ef4444; font-weight: bold; font-size: 1.2rem;">فشل تسجيل الدخول من خلال ديسكورد</p>
            <p style="color: #a1a1aa; margin-bottom: 1.5rem;">${errorMsg}</p>
            <button onclick="window.close()" style="background: #10b981; color: #000; font-weight: bold; border: none; padding: 0.6rem 1.2rem; border-radius: 0.5rem; cursor: pointer;">إغلاق النافذة</button>
          </body>
        </html>
      `);
    }
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

      const s3Client = getR2Client();
      const bucketName = process.env.R2_BUCKET_NAME;

      if (s3Client && bucketName) {
        await s3Client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: filename,
          Body: req.body,
          ContentType: req.headers["content-type"] || "application/octet-stream"
        }));
        console.log(`[Cloudflare R2 Proxy] PUT direct saved to R2: ${filename}`);
        return res.status(200).send("OK");
      }
      
      const filePath = path.join(process.cwd(), "uploads", filename);
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, req.body);
      
      console.log(`[Local Upload] Direct PUT saved to: ${filePath}`);
      res.status(200).send("OK");
    } catch (error: any) {
      console.error("[Upload Proxy Error] PUT direct upload failed:", error.message);
      res.status(500).send("Upload failed: " + error.message);
    }
  });



  function getR2Client() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) return null;

    return new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  // Base64 image POST upload (R2 or fallback to local)
  app.post("/api/upload", async (req, res) => {
    try {
      const { base64Data, filename, contentType } = req.body;
      if (!base64Data || !filename) {
        return res.status(400).json({ error: "Missing base64Data or filename" });
      }

      const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      let buffer: Buffer;
      let finalContentType = contentType || "application/octet-stream";
      
      if (matches && matches.length === 3) {
        finalContentType = contentType || `image/${matches[1]}`;
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(base64Data, "base64");
      }

      const s3Client = getR2Client();
      const bucketName = process.env.R2_BUCKET_NAME;
      const publicUrl = process.env.R2_PUBLIC_URL;

      if (s3Client && bucketName && publicUrl) {
        const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9./-]/g, '_')}`;
        await s3Client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: safeFilename,
          Body: buffer,
          ContentType: finalContentType
        }));
        
        const fileUrl = `${publicUrl.replace(/\/+$/, '')}/${safeFilename}`;
        console.log(`[Cloudflare R2 Upload] POST saved to: ${fileUrl}`);
        return res.json({ url: fileUrl });
      }

      // Fallback to local
      const filePath = path.join(process.cwd(), "uploads", filename);
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, buffer);

      console.log(`[Local Upload] POST saved to: ${filePath}`);
      res.json({ url: `/uploads/${filename}` });
    } catch (error: any) {
      console.error("[Upload Error] POST upload failed:", error.message);
      res.status(500).json({ error: "Upload failed: " + error.message });
    }
  });

  // Proxy endpoint can remain the same



  app.post("/api/local-presign", async (req, res) => {
    try {
      const { filename, contentType } = req.body;
      if (!filename || !contentType) {
        return res.status(400).json({ error: "Filename and contentType are required" });
      }

      const s3Client = getR2Client();
      const publicUrl = process.env.R2_PUBLIC_URL;

      const cleanFilename = filename.replace(/[^a-zA-Z0-9./-]/g, '_');
      const safeFilename = `manga/${Date.now()}-${cleanFilename}`;

      const uploadUrl = `/api/upload-direct?filename=${encodeURIComponent(safeFilename)}`;
      let url = `/uploads/${safeFilename}`;

      if (s3Client && publicUrl) {
         url = `${publicUrl.replace(/\/+$/, '')}/${safeFilename}`;
      }

      return res.json({ uploadUrl, url });
    } catch (error: any) {
      console.error("[Presign Error] Single build failed:", error.message);
      res.status(500).json({ error: "Failed to create upload link" });
    }
  });

  // Local high-performance batch presign (for seamless admin chapter uploads)
  app.post("/api/local-presign-batch", async (req, res) => {
    try {
      const { files } = req.body;
      if (!files || !Array.isArray(files)) {
        return res.status(400).json({ error: "Files array is required" });
      }

      const s3Client = getR2Client();
      const publicUrl = process.env.R2_PUBLIC_URL;

      const results = [];
      for (const f of files) {
        const cleanFilename = f.filename.replace(/[^a-zA-Z0-9./-]/g, '_');
        const safeFilename = `manga/${Date.now()}-${cleanFilename}`;
        
        const uploadUrl = `/api/upload-direct?filename=${encodeURIComponent(safeFilename)}`;
        let url = `/uploads/${safeFilename}`;

        if (s3Client && publicUrl) {
           url = `${publicUrl.replace(/\/+$/, '')}/${safeFilename}`;
        }
        results.push({ uploadUrl, url, filename: f.filename });
      }

      res.json({ results });
    } catch (error: any) {
      console.error("[Presign Error] Batch build failed:", error.message);
      res.status(500).json({ error: "Failed to create batch upload links" });
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
