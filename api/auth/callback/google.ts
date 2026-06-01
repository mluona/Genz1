import axios from "axios";
import { executeQuery } from "../../../server-db";

export default async function handler(req: any, res: any) {
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
    const protocol = req.headers["x-forwarded-proto"] || "https";
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
}
