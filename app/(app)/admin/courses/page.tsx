import { prisma } from "@/lib/prisma";
import { AdminCoursesClient } from "@/components/admin/courses-client";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      modules: {
        include: { lessons: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  return (
    <AdminCoursesClient
      courses={courses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        order: c.order,
        isPublished: c.isPublished,
        coverUrl: c.coverUrl,
        modules: c.modules.map((m) => ({
          id: m.id,
          title: m.title,
          order: m.order,
          lessons: m.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            order: l.order,
            isPublished: l.isPublished,
            duration: l.duration,
            videoUrl: l.videoUrl,
          })),
        })),
      }))}
    />
  );
}
