import express from "express";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { executeQuery, initDb } from "../server-db";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize SQLite database schema
let dbInitialized = false;
async function ensureDb() {
  if (!dbInitialized) {
    await initDb().catch((err) => {
      console.error("[Vercel DB Init Failed]:", err);
    });
    dbInitialized = true;
  }
}

// Password hashing helper for custom auth
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

// ----------------------------------------------------
// DB Endpoints
// ----------------------------------------------------
app.post("/api/db", async (req, res) => {
  try {
    await ensureDb();
    const {
      tableName,
      operation,
      filters = [],
      orderField = null,
      orderAscending = true,
      limitCount = null,
      isSingle = false,
      isMaybeSingle = false,
      data = null,
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
    console.error("[Vercel DB handler error]:", err);
    res.status(500).json({ data: null, error: { message: err.message || String(err) } });
  }
});

// ----------------------------------------------------
// Image Proxies
// ----------------------------------------------------
app.get("/api/local-image", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).send("URL is required");
    }

    if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
      const cleanPath = url.replace(/^\//, "");
      const filePath = path.join(process.cwd(), cleanPath);
      if (fs.existsSync(filePath)) {
        res.setHeader("Content-Type", "image/jpeg");
        return res.send(fs.readFileSync(filePath));
      } else {
        return res.status(404).send("File not found");
      }
    }

    const response = await axios.get(url, { responseType: "arraybuffer" });
    res.setHeader("Content-Type", response.headers["content-type"] || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.send(response.data);
  } catch (error: any) {
    console.error("[Local Proxy Error]:", error.message);
    res.status(500).send("Failed to retrieve image: " + error.message);
  }
});

app.post("/api/proxy-image", async (req, res) => {
  const { url, referer, cookies } = req.body;
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
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
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
});

// ----------------------------------------------------
// Translation
// ----------------------------------------------------
app.post("/api/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: "Text and targetLanguage are required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following text to ${targetLanguage}. Only return the translated text, nothing else.\n\n${text}`,
      config: { temperature: 0.3 },
    });

    res.json({ translatedText: response.text?.trim() || text });
  } catch (error: any) {
    console.error("Translation error:", error.message);
    res.status(500).json({ error: "Failed to translate text" });
  }
});

// ----------------------------------------------------
// Auth Signup & Signin
// ----------------------------------------------------
app.post("/api/auth/signup", async (req, res) => {
  try {
    await ensureDb();
    const { email, password, username } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان!" });
    }

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
      password_hash: passHash,
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
        avatar_url: defaultProfile.profilePicture,
      },
      created_at: new Date().toISOString(),
    };

    res.status(200).json({ user });
  } catch (err: any) {
    console.error("[Vercel Auth Signup Error]:", err);
    res.status(500).json({ error: err.message || "فشلت عملية إنشاء الحساب." });
  }
});

app.post("/api/auth/signin", async (req, res) => {
  try {
    await ensureDb();
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
        avatar_url: profile.profilePicture,
      },
      created_at: new Date().toISOString(),
    };

    res.status(200).json({ user });
  } catch (err: any) {
    console.error("[Vercel Auth Signin Error]:", err);
    res.status(500).json({ error: err.message || "فشلت عملية تسجيل الدخول." });
  }
});

// ----------------------------------------------------
// OAuth Redirect Setup
// ----------------------------------------------------
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
      prompt: "select_account",
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
      scope: "identify email",
    });
    return res.json({ url: `https://discord.com/api/oauth2/authorize?${params.toString()}` });
  }

  return res.status(400).json({ error: "Unsupported provider" });
});

app.get("/api/auth/callback/google", async (req, res) => {
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
    await ensureDb();
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!googleClientId || !googleClientSecret) {
      throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing.");
    }

    const host = req.headers.host || "localhost:3000";
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const redirectUri = `${protocol}://${host}/api/auth/callback/google`;

    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", new URLSearchParams({
      code,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { access_token } = tokenRes.data;

    const userRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id: googleId, email, name, picture } = userRes.data;

    if (!email) {
      throw new Error("Could not retrieve email from Google Account.");
    }

    let profileResult = await executeQuery("profiles", "select", [{ field: "google_id", op: "=", val: googleId }]);
    let profile = profileResult.data && profileResult.data.length > 0 ? profileResult.data[0] : null;

    if (!profile) {
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
      google_id: googleId,
    };

    await executeQuery("profiles", "insert", [], null, true, null, false, false, defaultProfile);

    if (defaultProfile.banned) {
      throw new Error("This account is banned.");
    }

    const user = {
      id: userId,
      uid: userId,
      email,
      user_metadata: {
        full_name: defaultProfile.username,
        avatar_url: defaultProfile.profilePicture,
      },
      created_at: new Date().toISOString(),
    };

    return res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 2rem; background: #121214; color: #fff;">
          <p style="color: #10b981; font-weight: bold; font-size: 1.2rem;">تم تسجيل الدخول بنجاح!</p>
          <p style="color: #a1a1aa;">يرجى الانتظار...</p>
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
    return res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 2rem; background: #121214; color: #fff;">
          <p style="color: #ef4444; font-weight: bold; font-size: 1.2rem;">فشل تسجيل الدخول</p>
          <p style="color: #a1a1aa; margin-bottom: 1.5rem;">${err.message || "حدث خطأ غير معروف"}</p>
          <button onclick="window.close()" style="background: #10b981; color: #000; font-weight: bold; border: none; padding: 0.6rem 1.2rem; border-radius: 0.5rem; cursor: pointer;">إغلاق النافذة</button>
        </body>
      </html>
    `);
  }
});

app.get("/api/auth/callback/discord", async (req, res) => {
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
    await ensureDb();
    const discordClientId = process.env.DISCORD_CLIENT_ID;
    const discordClientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (!discordClientId || !discordClientSecret) {
      throw new Error("DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET is missing.");
    }

    const host = req.headers.host || "localhost:3000";
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const redirectUri = `${protocol}://${host}/api/auth/callback/discord`;

    const tokenRes = await axios.post("https://discord.com/api/oauth2/token", new URLSearchParams({
      code,
      client_id: discordClientId,
      client_secret: discordClientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { access_token } = tokenRes.data;

    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id: discordId, username, email, avatar } = userRes.data;

    if (!email) {
      throw new Error("Could not retrieve email from Discord Account.");
    }

    const avatarUrl = avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${discordId}`;

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
      discord_id: discordId,
    };

    await executeQuery("profiles", "insert", [], null, true, null, false, false, defaultProfile);

    if (defaultProfile.banned) {
      throw new Error("This account is banned.");
    }

    const user = {
      id: userId,
      uid: userId,
      email,
      user_metadata: {
        full_name: defaultProfile.username,
        avatar_url: defaultProfile.profilePicture,
      },
      created_at: new Date().toISOString(),
    };

    return res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 2rem; background: #121214; color: #fff;">
          <p style="color: #10b981; font-weight: bold; font-size: 1.2rem;">تم تسجيل الدخول بنجاح!</p>
          <p style="color: #a1a1aa;">يرجى الانتظار...</p>
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
    return res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 2rem; background: #121214; color: #fff;">
          <p style="color: #ef4444; font-weight: bold; font-size: 1.2rem;">فشل تسجيل الدخول</p>
          <p style="color: #a1a1aa; margin-bottom: 1.5rem;">${err.message || "حدث خطأ غير معروف"}</p>
          <button onclick="window.close()" style="background: #10b981; color: #000; font-weight: bold; border: none; padding: 0.6rem 1.2rem; border-radius: 0.5rem; cursor: pointer;">إغلاق النافذة</button>
        </body>
      </html>
    `);
  }
});

// ----------------------------------------------------
// File Uploads & Presigning
// ----------------------------------------------------
app.post("/api/local-presign", async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
      return res.status(400).json({ error: "Filename and contentType are required" });
    }

    const cleanFilename = filename.replace(/[^a-zA-Z0-9./-]/g, "_");
    const safeFilename = `manga/${Date.now()}-${cleanFilename}`;
    const uploadUrl = `/api/upload-direct?filename=${encodeURIComponent(safeFilename)}`;
    const url = `/uploads/${safeFilename}`;

    res.status(200).json({ uploadUrl, url });
  } catch (error: any) {
    console.error("[Local Presign Error]:", error.message);
    res.status(500).json({ error: "Failed to create local upload link" });
  }
});

app.post("/api/local-presign-batch", async (req, res) => {
  try {
    const { files } = req.body;
    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ error: "Files array is required" });
    }

    const results = files.map((f: any) => {
      const cleanFilename = f.filename.replace(/[^a-zA-Z0-9./-]/g, "_");
      const safeFilename = `manga/${Date.now()}-${cleanFilename}`;
      const uploadUrl = `/api/upload-direct?filename=${encodeURIComponent(safeFilename)}`;
      const url = `/uploads/${safeFilename}`;
      return { uploadUrl, url, filename: f.filename };
    });

    res.status(200).json({ results });
  } catch (error: any) {
    console.error("[Local Batch Presign Error]:", error.message);
    res.status(500).json({ error: "Failed to create local batch upload links" });
  }
});

app.post("/api/upload", async (req, res) => {
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

    res.status(200).json({ url: `/uploads/${filename}` });
  } catch (error: any) {
    console.error("[Upload POST Error]:", error.message);
    res.status(500).json({ error: "Upload failed: " + error.message });
  }
});

app.put("/api/upload-direct", express.raw({ type: "*/*", limit: "150mb" }), async (req, res) => {
  try {
    const { filename } = req.query;
    if (!filename || typeof filename !== "string") {
      return res.status(400).send("Filename is required");
    }

    const filePath = path.join(process.cwd(), "uploads", filename);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    await fs.promises.writeFile(filePath, buffer);
    res.status(200).send("OK");
  } catch (error: any) {
    console.error("[Upload PUT Error]:", error.message);
    res.status(500).send("Upload failed: " + error.message);
  }
});

// ----------------------------------------------------
// Scraping Placeholder
// ----------------------------------------------------
app.all("/api/scrape", (req, res) => {
  res.status(501).json({
    error:
      "Auto-import (Scraping) is not supported on Vercel out of the box because it requires a full browser (Puppeteer). Please use the AI Studio preview or a VPS to use the scraper.",
  });
});

// ----------------------------------------------------
// Storj S3 Compatibility API
// ----------------------------------------------------
const getS3Client = () => {
  const accessKeyId = process.env.STORJ_ACCESS_KEY_ID;
  const secretAccessKey = process.env.STORJ_SECRET_ACCESS_KEY;
  const endpoint = process.env.STORJ_ENDPOINT;
  if (!accessKeyId || !secretAccessKey || !endpoint) return null;
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
};

app.get("/api/storj-get-url", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    const s3 = getS3Client();
    const bucketName = process.env.STORJ_BUCKET_NAME;
    if (!s3 || !bucketName) {
      return res.status(500).json({ error: "Storj credentials not configured" });
    }

    let key = url;
    try {
      const parsedUrl = new URL(url);
      let pathname = parsedUrl.pathname;
      if (pathname.startsWith(`/${bucketName}/`)) {
        key = pathname.substring(bucketName.length + 2);
      } else if (pathname.startsWith("/")) {
        key = pathname.substring(1);
      }
    } catch (e) {}

    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.json({ url: signedUrl });
  } catch (error: any) {
    console.error("Storj Get Presign Error:", error.message);
    res.status(500).json({ error: "Failed to generate presigned GET URL" });
  }
});

app.get("/api/storj-image", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    const s3 = getS3Client();
    const bucketName = process.env.STORJ_BUCKET_NAME;
    if (!s3 || !bucketName) {
      return res.status(500).json({ error: "Storj credentials not configured" });
    }

    const keyMatch = url.match(/manga\/.+$/);
    if (!keyMatch) {
      return res.status(400).json({ error: "Invalid Storj URL format" });
    }
    const key = keyMatch[0];

    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.redirect(signedUrl);
  } catch (error: any) {
    console.error("Storj Get URL Error:", error.message);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
});

app.post("/api/storj-presign", async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
      return res.status(400).json({ error: "Filename and contentType are required" });
    }

    const s3 = getS3Client();
    const bucketName = process.env.STORJ_BUCKET_NAME;
    const publicUrl = process.env.STORJ_PUBLIC_URL;
    if (!s3 || !bucketName || !publicUrl) {
      return res.status(500).json({ error: "Storj credentials not fully configured" });
    }

    const key = `manga/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const command = new PutObjectCommand({ Bucket: bucketName, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const url = `${publicUrl.replace(/\/$/, "")}/${key}`;

    res.status(200).json({ uploadUrl, url });
  } catch (error: any) {
    console.error("Storj Presign Error:", error.message);
    res.status(500).json({ error: "Failed to generate presigned URL" });
  }
});

// ----------------------------------------------------
// Health Check & Fallback
// ----------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.path}` });
});

export default app;
