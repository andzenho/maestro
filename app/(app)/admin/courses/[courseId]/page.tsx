import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CourseEditor } from "@/components/admin/course-editor";

export default async function CourseEditorPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  if (courseId === "new") {
    return <CourseEditor course={null} />;
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: { lessons: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) notFound();

  return <CourseEditor course={course} />;
}
