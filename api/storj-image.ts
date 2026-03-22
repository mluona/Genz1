import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export default async function handler(req: any, res: any) {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).send("URL is required");
    }

    const accessKeyId = process.env.STORJ_ACCESS_KEY_ID;
    const secretAccessKey = process.env.STORJ_SECRET_ACCESS_KEY;
    const bucketName = process.env.STORJ_BUCKET_NAME;
    const endpoint = process.env.STORJ_ENDPOINT;

    if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint) {
      return res.status(500).send("Storj credentials not configured");
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

    const response = await s3.send(command);

    if (response.ContentType) {
      res.setHeader("Content-Type", response.ContentType);
    }
    res.setHeader("Cache-Control", "public, max-age=31536000");

    if (response.Body) {
      const stream = response.Body as any;
      stream.pipe(res);
      stream.on("error", (err: any) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).send("Error streaming image");
        } else {
          res.end();
        }
      });
    } else {
      res.status(404).send("Image not found");
    }
  } catch (error: any) {
    console.error("Storj Image Proxy Error:", error.message);
    res.status(500).send("Failed to fetch image from Storj");
  }
}
