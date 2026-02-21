import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;
  const body = await req.json();
  const { watchedSeconds, isCompleted } = body;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const existingProgress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
  });

  const shouldComplete =
    isCompleted ||
    (existingProgress?.isCompleted) ||
    (lesson.duration && watchedSeconds / lesson.duration >= 0.8);

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: {
      watchedSeconds: Math.max(watchedSeconds, existingProgress?.watchedSeconds || 0),
      isCompleted: shouldComplete || false,
      completedAt:
        shouldComplete && !existingProgress?.isCompleted ? new Date() : existingProgress?.completedAt,
      lastWatchedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      lessonId,
      watchedSeconds,
      isCompleted: shouldComplete || false,
      completedAt: shouldComplete ? new Date() : null,
      lastWatchedAt: new Date(),
    },
  });

  return NextResponse.json(progress);
}
