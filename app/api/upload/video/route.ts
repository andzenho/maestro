import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.CF_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CF_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CF_R2_SECRET_KEY!,
  },
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const lessonId = formData.get("lessonId") as string | null;

    if (!file || !lessonId)
      return NextResponse.json({ error: "file and lessonId required" }, { status: 400 });

    const ext = file.name.split(".").pop() || "mp4";
    const key = `videos/${lessonId}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.CF_R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type || "video/mp4",
      })
    );

    const url = `${process.env.CF_R2_PUBLIC_URL}/${key}`;
    return NextResponse.json({ url, key, duration: null });
  } catch (error) {
    console.error("Video upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
