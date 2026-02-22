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
  const userId = session.user.id;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const existingProgress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  const shouldComplete =
    isCompleted ||
    existingProgress?.isCompleted ||
    (lesson.duration && watchedSeconds / lesson.duration >= 0.8);

  const justCompleted = shouldComplete && !existingProgress?.isCompleted;

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      watchedSeconds: Math.max(watchedSeconds, existingProgress?.watchedSeconds || 0),
      isCompleted: shouldComplete || false,
      completedAt: justCompleted ? new Date() : existingProgress?.completedAt,
      lastWatchedAt: new Date(),
    },
    create: {
      userId,
      lessonId,
      watchedSeconds,
      isCompleted: shouldComplete || false,
      completedAt: shouldComplete ? new Date() : null,
      lastWatchedAt: new Date(),
    },
  });

  // Auto-issue certificate if course is 100% complete
  if (justCompleted) {
    const courseId = lesson.module.course.id;
    try {
      const allLessons = await prisma.lesson.findMany({
        where: { module: { courseId }, isPublished: true },
        select: { id: true },
      });
      const completedCount = await prisma.lessonProgress.count({
        where: {
          userId,
          lessonId: { in: allLessons.map((l) => l.id) },
          isCompleted: true,
        },
      });

      if (completedCount >= allLessons.length && allLessons.length > 0) {
        await prisma.certificate.upsert({
          where: { userId_courseId: { userId, courseId } },
          update: {},
          create: { userId, courseId },
        });
      }
    } catch (err) {
      console.error("Certificate check error:", err);
    }
  }

  return NextResponse.json({ ...progress, justCompleted: justCompleted || false });
}
