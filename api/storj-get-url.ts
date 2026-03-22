import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function handler(req: any, res: any) {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    const accessKeyId = process.env.STORJ_ACCESS_KEY_ID;
    const secretAccessKey = process.env.STORJ_SECRET_ACCESS_KEY;
    const bucketName = process.env.STORJ_BUCKET_NAME;
    const endpoint = process.env.STORJ_ENDPOINT;

    if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint) {
      return res
        .status(500)
        .json({ error: "Storj credentials not configured" });
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint: endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    let key = url;
    try {
      const parsedUrl = new URL(url);
      let pathname = parsedUrl.pathname;
      if (pathname.startsWith(`/${bucketName}/`)) {
        key = pathname.substring(bucketName.length + 2);
      } else if (pathname.startsWith("/")) {
        key = pathname.substring(1);
      }
    } catch (e) {
      // Ignore parsing errors, use url as key
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.json({ url: signedUrl });
  } catch (error: any) {
    console.error("Storj Get Presign Error:", error.message);
    res.status(500).json({ error: "Failed to generate presigned GET URL" });
  }
}
