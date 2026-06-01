import { executeQuery } from "../server-db";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      tableName,
      operation,
      filters,
      orderField,
      orderAscending,
      limitCount,
      isSingle,
      isMaybeSingle,
      data
    } = req.body;

    const result = await executeQuery(
      tableName,
      operation,
      filters || [],
      orderField || null,
      orderAscending !== undefined ? orderAscending : true,
      limitCount || null,
      isSingle || false,
      isMaybeSingle || false,
      data || null
    );

    res.status(200).json(result);
  } catch (err: any) {
    console.error("Vercel DB handler error:", err);
    res.status(500).json({ data: null, error: { message: err.message || String(err) } });
  }
}
