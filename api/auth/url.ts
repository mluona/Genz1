export default async function handler(req: any, res: any) {
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
}
