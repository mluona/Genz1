import { executeQuery } from "../../server-db";
import crypto from "crypto";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    res.status(200).json({ user });
  } catch (err: any) {
    console.error("[Vercel Auth Signup Error]:", err);
    res.status(500).json({ error: err.message || "فشلت عملية إنشاء الحساب." });
  }
}
