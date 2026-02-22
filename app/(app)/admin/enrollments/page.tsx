import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EnrollmentsClient } from "@/components/admin/enrollments-client";
import { Users } from "lucide-react";

export default async function AdminEnrollmentsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  const [enrollments, users, courses] = await Promise.all([
    prisma.courseEnrollment.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.course.findMany({
      select: { id: true, title: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(74,222,128,0.1)] flex items-center justify-center">
          <Users size={18} className="text-[#4ade80]" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-[#e8f5e8]"
            style={{ fontFamily: "var(--font-unbounded)" }}
          >
            Зачисления
          </h1>
          <p className="text-sm text-[#6b8f6b] mt-0.5">
            Управление доступом студентов к курсам
          </p>
        </div>
      </div>

      <EnrollmentsClient
        initialEnrollments={enrollments.map((e) => ({
          ...e,
          createdAt: e.createdAt.toISOString(),
        }))}
        users={users}
        courses={courses}
      />
    </div>
  );
}
