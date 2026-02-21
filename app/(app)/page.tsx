import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // Fetch user with group
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { group: true },
  });

  // Fetch progress stats
  const totalLessons = await prisma.lesson.count({
    where: { isPublished: true },
  });

  const completedLessons = await prisma.lessonProgress.count({
    where: { userId, isCompleted: true },
  });

  // Fetch next event
  const nextEvent = await prisma.event.findFirst({
    where: { startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
  });

  // Recent progress
  const recentProgress = await prisma.lessonProgress.findMany({
    where: { userId },
    include: { lesson: { include: { module: { include: { course: true } } } } },
    orderBy: { lastWatchedAt: "desc" },
    take: 5,
  });

  // Courses with progress
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              progress: { where: { userId } },
            },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  const courseStats = courses.map((course) => {
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const completed = allLessons.filter(
      (l) => l.progress[0]?.isCompleted
    ).length;
    return {
      id: course.id,
      title: course.title,
      total: allLessons.length,
      completed,
      percent: allLessons.length > 0 ? Math.round((completed / allLessons.length) * 100) : 0,
    };
  });

  return (
    <DashboardClient
      user={user}
      totalLessons={totalLessons}
      completedLessons={completedLessons}
      nextEvent={nextEvent ? {
        id: nextEvent.id,
        title: nextEvent.title,
        type: nextEvent.type,
        startsAt: nextEvent.startsAt.toISOString(),
        meetingUrl: nextEvent.meetingUrl,
      } : null}
      recentProgress={recentProgress.map((p) => ({
        lessonId: p.lessonId,
        lessonTitle: p.lesson.title,
        courseTitle: p.lesson.module.course.title,
        isCompleted: p.isCompleted,
        lastWatchedAt: p.lastWatchedAt.toISOString(),
      }))}
      courseStats={courseStats}
      userName={`${user?.firstName} ${user?.lastName}`}
    />
  );
}
