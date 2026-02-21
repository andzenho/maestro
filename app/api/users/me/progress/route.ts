import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id },
    include: {
      lesson: {
        include: { module: { include: { course: true } } },
      },
    },
    orderBy: { lastWatchedAt: "desc" },
  });

  const totalLessons = await prisma.lesson.count({ where: { isPublished: true } });
  const completedCount = progress.filter((p) => p.isCompleted).length;

  return NextResponse.json({
    progress,
    totalLessons,
    completedCount,
    percent: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
  });
}
