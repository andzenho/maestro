import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/video-player";

interface LessonPageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseId, lessonId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: true,
          lessons: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
          },
        },
      },
      progress: { where: { userId } },
      materials: { orderBy: { order: "asc" } },
    },
  });

  if (!lesson || lesson.module.course.id !== courseId) {
    notFound();
  }

  const allModules = await prisma.module.findMany({
    where: { courseId },
    include: {
      lessons: {
        where: { isPublished: true },
        include: { progress: { where: { userId } } },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  const allLessons = allModules.flatMap((m) =>
    m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      moduleTitle: m.title,
      isCompleted: l.progress[0]?.isCompleted || false,
      duration: l.duration,
    }))
  );

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const progress = lesson.progress[0];

  const [comments, homework, note] = await Promise.all([
    prisma.lessonComment.findMany({
      where: { lessonId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.homework.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    }),
    prisma.userNote.findFirst({
      where: { userId, lessonId },
    }),
  ]);

  return (
    <VideoPlayer
      lesson={{
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        courseTitle: lesson.module.course.title,
        moduleTitle: lesson.module.title,
      }}
      courseId={courseId}
      progress={{
        watchedSeconds: progress?.watchedSeconds || 0,
        isCompleted: progress?.isCompleted || false,
      }}
      allLessons={allLessons}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
      materials={lesson.materials}
      initialHomework={homework ? {
        id: homework.id,
        text: homework.text,
        fileUrl: homework.fileUrl,
        status: homework.status,
        adminComment: homework.adminComment,
      } : null}
      initialComments={comments.map((c) => ({
        id: c.id,
        text: c.text,
        createdAt: c.createdAt.toISOString(),
        user: c.user,
      }))}
      initialNote={note?.text || ""}
      currentUserId={userId}
    />
  );
}
