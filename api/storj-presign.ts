import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function handler(req: any, res: any) {
  try {
    const { filename, contentType } = req.body;

    if (!filename || !contentType) {
      return res
        .status(400)
        .json({ error: "Filename and contentType are required" });
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

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    const url = `${endpoint}/${bucketName}/${filename}`;

    res.json({ uploadUrl, url });
  } catch (error: any) {
    console.error("Storj Presign Error:", error.message);
    res.status(500).json({ error: "Failed to generate presigned URL" });
  }
}
