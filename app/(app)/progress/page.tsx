import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProgressClient } from "@/components/progress-client";

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // Overall stats
  const totalLessons = await prisma.lesson.count({ where: { isPublished: true } });
  const completedLessons = await prisma.lessonProgress.count({
    where: { userId, isCompleted: true },
  });

  // Course-level progress
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      modules: {
        include: {
          lessons: {
            where: { isPublished: true },
            include: { progress: { where: { userId } } },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  const courseStats = courses.map((course) => {
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const completed = allLessons.filter((l) => l.progress[0]?.isCompleted).length;
    const moduleStats = course.modules.map((m) => {
      const mLessons = m.lessons;
      const mCompleted = mLessons.filter((l) => l.progress[0]?.isCompleted).length;
      return {
        id: m.id,
        title: m.title,
        total: mLessons.length,
        completed: mCompleted,
        percent: mLessons.length > 0 ? Math.round((mCompleted / mLessons.length) * 100) : 0,
      };
    });

    return {
      id: course.id,
      title: course.title,
      total: allLessons.length,
      completed,
      percent: allLessons.length > 0 ? Math.round((completed / allLessons.length) * 100) : 0,
      modules: moduleStats,
    };
  });

  // Activity grid: last 52 weeks
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const activityData = await prisma.lessonProgress.findMany({
    where: {
      userId,
      lastWatchedAt: { gte: since },
    },
    select: { lastWatchedAt: true },
    orderBy: { lastWatchedAt: "asc" },
  });

  // Group by day
  const activityMap: Record<string, number> = {};
  activityData.forEach((p) => {
    const day = p.lastWatchedAt.toISOString().split("T")[0];
    activityMap[day] = (activityMap[day] || 0) + 1;
  });

  // Build grid for last 364 days
  const today = new Date();
  const days: { date: string; count: number }[] = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({ date: dateStr, count: activityMap[dateStr] || 0 });
  }

  return (
    <ProgressClient
      totalLessons={totalLessons}
      completedLessons={completedLessons}
      courseStats={courseStats}
      activityDays={days}
    />
  );
}
