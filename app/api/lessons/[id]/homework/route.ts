import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = session.user.id;

  // Admin: get all homework for this lesson
  if (session.user.role === "ADMIN") {
    const homework = await prisma.homework.findMany({
      where: { lessonId: id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(homework);
  }

  // Student: get own homework
  const homework = await prisma.homework.findUnique({
    where: { userId_lessonId: { userId, lessonId: id } },
  });
  return NextResponse.json(homework);
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const userId = session.user.id;

  const homework = await prisma.homework.upsert({
    where: { userId_lessonId: { userId, lessonId: id } },
    update: {
      text: body.text,
      fileUrl: body.fileUrl,
      fileKey: body.fileKey,
      status: "SUBMITTED",
    },
    create: {
      lessonId: id,
      userId,
      text: body.text,
      fileUrl: body.fileUrl,
      fileKey: body.fileKey,
      status: "SUBMITTED",
    },
  });
  return NextResponse.json(homework);
}
