import { executeQuery } from "../../server-db";
import crypto from "crypto";

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === verifyHash;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    res.status(200).json({ user });
  } catch (err: any) {
    console.error("[Vercel Auth Signin Error]:", err);
    res.status(500).json({ error: err.message || "فشلت عملية تسجيل الدخول." });
  }
}
