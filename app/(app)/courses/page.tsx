import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Lock, PlayCircle } from "lucide-react";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      modules: {
        include: {
          lessons: {
            where: { isPublished: true },
            include: {
              progress: { where: { userId } },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-[#e8f5e8]"
          style={{ fontFamily: "var(--font-unbounded)" }}
        >
          Курсы
        </h1>
        <p className="text-sm text-[#6b8f6b] mt-1">
          Все доступные курсы по продюсированию
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <BookOpen size={40} className="text-[#3d5c3d] mx-auto mb-3" />
          <p className="text-[#6b8f6b]">Курсы скоро появятся</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const allLessons = course.modules.flatMap((m) => m.lessons);
            const completed = allLessons.filter((l) => l.progress[0]?.isCompleted).length;
            const percent = allLessons.length > 0 ? Math.round((completed / allLessons.length) * 100) : 0;
            const firstLesson = allLessons[0];

            return (
              <div key={course.id} className="glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(74,222,128,0.15)] flex items-center justify-center shrink-0">
                      <BookOpen size={18} className="text-[#4ade80]" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-[#e8f5e8]">
                        {course.title}
                      </h2>
                      {course.description && (
                        <p className="text-sm text-[#6b8f6b] mt-1">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-[#4ade80]">{percent}%</p>
                    <p className="text-xs text-[#6b8f6b]">
                      {completed}/{allLessons.length}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-[rgba(74,222,128,0.1)] rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Modules */}
                <div className="space-y-2">
                  {course.modules.map((module) => {
                    const modLessons = module.lessons;
                    const modCompleted = modLessons.filter((l) => l.progress[0]?.isCompleted).length;
                    const firstLesson = modLessons[0];

                    return (
                      <div
                        key={module.id}
                        className="rounded-xl bg-[rgba(74,222,128,0.04)] border border-[rgba(74,222,128,0.08)] p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-[#a8c8a8]">
                            {module.title}
                          </p>
                          <span className="text-xs text-[#6b8f6b]">
                            {modCompleted}/{modLessons.length}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {modLessons.slice(0, 3).map((lesson) => {
                            const isCompleted = lesson.progress[0]?.isCompleted;
                            return (
                              <Link
                                key={lesson.id}
                                href={`/courses/${course.id}/${lesson.id}`}
                                className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-[rgba(74,222,128,0.08)] transition-colors group"
                              >
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                    isCompleted
                                      ? "bg-[rgba(74,222,128,0.2)]"
                                      : "bg-[rgba(74,222,128,0.05)] border border-[rgba(74,222,128,0.2)]"
                                  }`}
                                >
                                  {isCompleted ? (
                                    <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
                                  ) : (
                                    <PlayCircle size={8} className="text-[#6b8f6b]" />
                                  )}
                                </div>
                                <span
                                  className={`text-xs truncate ${
                                    isCompleted ? "text-[#6b8f6b] line-through" : "text-[#e8f5e8]"
                                  } group-hover:text-[#4ade80] transition-colors`}
                                >
                                  {lesson.title}
                                </span>
                                {lesson.duration && (
                                  <span className="text-[10px] text-[#3d5c3d] ml-auto shrink-0">
                                    {Math.round(lesson.duration / 60)} мин
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                          {modLessons.length > 3 && (
                            <Link
                              href={`/courses/${course.id}/${modLessons[0]?.id}`}
                              className="text-xs text-[#4ade80] px-2 hover:underline"
                            >
                              + ещё {modLessons.length - 3} урок(а)
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {firstLesson && (
                  <Link
                    href={`/courses/${course.id}/${firstLesson.id}`}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-[rgba(74,222,128,0.1)] text-[#4ade80] rounded-xl text-sm font-medium hover:bg-[rgba(74,222,128,0.2)] transition-colors border border-[rgba(74,222,128,0.15)]"
                  >
                    <PlayCircle size={16} />
                    {completed > 0 ? "Продолжить курс" : "Начать курс"}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
