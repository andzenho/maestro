import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { HomeworkClient } from "@/components/admin/homework-client";
import { ClipboardList } from "lucide-react";

export default async function AdminHomeworkPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  const homework = await prisma.homework.findMany({
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
      lesson: {
        select: {
          id: true,
          title: true,
          module: { select: { title: true, course: { select: { title: true } } } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Only show non-pending homework
  const items = homework
    .filter((h) => h.status !== "PENDING")
    .map((h) => ({
      id: h.id,
      text: h.text,
      fileUrl: h.fileUrl,
      status: h.status as string,
      adminComment: h.adminComment,
      createdAt: h.createdAt.toISOString(),
      user: h.user,
      lesson: h.lesson,
    }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(74,222,128,0.1)] flex items-center justify-center">
          <ClipboardList size={18} className="text-[#4ade80]" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-[#e8f5e8]"
            style={{ fontFamily: "var(--font-unbounded)" }}
          >
            Домашние задания
          </h1>
          <p className="text-sm text-[#6b8f6b] mt-0.5">
            Проверка работ студентов
          </p>
        </div>
      </div>

      <HomeworkClient initialItems={items} />
    </div>
  );
}
