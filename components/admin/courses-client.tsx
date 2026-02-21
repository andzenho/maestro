"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Plus, Edit2, Trash2, Eye, EyeOff, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CourseItem {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  isPublished: boolean;
  coverUrl?: string | null;
  modules: { id: string; title: string; lessons: { id: string }[] }[];
}

export function AdminCoursesClient({ courses: init }: { courses: CourseItem[] }) {
  const [courses, setCourses] = useState(init);
  const router = useRouter();

  const togglePublish = async (id: string, current: boolean) => {
    const res = await fetch(`/api/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !current }),
    });
    if (res.ok) {
      setCourses(courses.map(c => c.id === id ? { ...c, isPublished: !current } : c));
      toast.success(!current ? "Курс опубликован" : "Курс скрыт");
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Удалить курс и все его модули и уроки?")) return;
    const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCourses(courses.filter(c => c.id !== id));
      toast.success("Курс удалён");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold" style={{ fontFamily: "var(--font-unbounded)", color: "var(--text-1)" }}>
            Курсы
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-3)" }}>
            {courses.length} курсов в базе
          </p>
        </div>
        <Button asChild className="h-9 text-[13px] font-semibold"
          style={{ background: "var(--accent)", color: "#fff", borderRadius: 10 }}>
          <Link href="/admin/courses/new">
            <Plus size={15} className="mr-1.5" /> Новый курс
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="surface p-16 text-center" style={{ borderRadius: 16 }}>
          <BookOpen size={36} style={{ color: "var(--text-3)", opacity: 0.4, margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-3)" }}>Курсов пока нет</p>
          <Link href="/admin/courses/new" className="text-[13px] mt-2 inline-block" style={{ color: "var(--accent)" }}>
            Создать первый курс →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course, i) => {
            const lessonCount = course.modules.reduce((a, m) => a + m.lessons.length, 0);
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="surface p-5 flex items-center gap-4"
                style={{ borderRadius: 14 }}
              >
                {/* Rank */}
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[12px] font-bold shrink-0"
                  style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                  {course.order || i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-semibold truncate" style={{ color: "var(--text-1)" }}>
                      {course.title}
                    </p>
                    <span className={`pill ${course.isPublished ? "pill-green" : "pill-red"}`}>
                      {course.isPublished ? "Опубликован" : "Скрыт"}
                    </span>
                  </div>
                  {course.description && (
                    <p className="text-[12px] truncate" style={{ color: "var(--text-3)" }}>{course.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-3)" }}>
                      <Layers size={10} /> {course.modules.length} модулей
                    </span>
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-3)" }}>
                      <BookOpen size={10} /> {lessonCount} уроков
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => togglePublish(course.id, course.isPublished)}
                    className="p-2 rounded-[8px] transition-colors"
                    style={{ background: "var(--surface-2)", color: course.isPublished ? "var(--green)" : "var(--text-3)" }}
                    title={course.isPublished ? "Скрыть" : "Опубликовать"}
                  >
                    {course.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <Button asChild variant="ghost" size="sm"
                    className="p-2 h-auto rounded-[8px]"
                    style={{ background: "var(--surface-2)", color: "var(--text-2)" }}>
                    <Link href={`/admin/courses/${course.id}`}>
                      <Edit2 size={14} />
                    </Link>
                  </Button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="p-2 rounded-[8px] transition-colors"
                    style={{ background: "var(--surface-2)", color: "var(--text-3)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
