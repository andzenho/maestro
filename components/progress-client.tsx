"use client";

import { motion } from "framer-motion";
import { CheckCircle2, BookOpen, BarChart3, Flame, Award } from "lucide-react";

interface ModuleStat {
  id: string;
  title: string;
  total: number;
  completed: number;
  percent: number;
}

interface CourseStat {
  id: string;
  title: string;
  total: number;
  completed: number;
  percent: number;
  modules: ModuleStat[];
}

interface ActivityDay {
  date: string;
  count: number;
}


interface Certificate {
  id: string;
  issuedAt: string;
  courseTitle: string;
  courseId: string;
}

interface ProgressClientProps {
  totalLessons: number;
  completedLessons: number;
  courseStats: CourseStat[];
  activityDays: ActivityDay[];
  certificates?: Certificate[];
}

export function ProgressClient({
  totalLessons,
  completedLessons,
  courseStats,
  activityDays,
  certificates = [],
}: ProgressClientProps) {
  const overallPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Activity streak
  const today = new Date().toISOString().split("T")[0];
  let streak = 0;
  for (let i = activityDays.length - 1; i >= 0; i--) {
    if (activityDays[i].count > 0) {
      streak++;
    } else {
      break;
    }
  }

  const maxActivity = Math.max(...activityDays.map((d) => d.count), 1);

  const getActivityColor = (count: number) => {
    if (count === 0) return "bg-[rgba(74,222,128,0.06)]";
    const intensity = count / maxActivity;
    if (intensity < 0.25) return "bg-[rgba(74,222,128,0.2)]";
    if (intensity < 0.5) return "bg-[rgba(74,222,128,0.4)]";
    if (intensity < 0.75) return "bg-[rgba(74,222,128,0.65)]";
    return "bg-[#4ade80]";
  };

  // Group activity days into weeks (columns)
  const weeks: ActivityDay[][] = [];
  for (let i = 0; i < activityDays.length; i += 7) {
    weeks.push(activityDays.slice(i, i + 7));
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  const monthLabels = () => {
    const labels: { label: string; colIndex: number }[] = [];
    let lastMonth = -1;
    activityDays.forEach((day, i) => {
      const month = new Date(day.date).getMonth();
      if (month !== lastMonth) {
        labels.push({
          label: new Date(day.date).toLocaleString("ru-RU", { month: "short" }),
          colIndex: Math.floor(i / 7),
        });
        lastMonth = month;
      }
    });
    return labels;
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div variants={item}>
        <h1
          className="text-2xl font-bold text-[#e8f5e8]"
          style={{ fontFamily: "var(--font-unbounded)" }}
        >
          Прогресс
        </h1>
        <p className="text-sm text-[#6b8f6b] mt-1">
          Твоя статистика обучения
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Уроков пройдено", value: completedLessons, icon: CheckCircle2, color: "#4ade80" },
          { label: "Всего уроков", value: totalLessons, icon: BookOpen, color: "#86efac" },
          { label: "Курсов", value: courseStats.length, icon: BarChart3, color: "#22c55e" },
          { label: "Дней подряд", value: streak, icon: Flame, color: "#fb923c" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}20` }}
              >
                <Icon size={16} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-[#e8f5e8]">{s.value}</p>
                <p className="text-xs text-[#6b8f6b]">{s.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Ring + course bars */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ring */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center">
          <h3 className="text-xs font-semibold text-[#a8c8a8] uppercase tracking-wider mb-4">
            Общий прогресс
          </h3>
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(74,222,128,0.1)" strokeWidth="12" />
              <motion.circle
                cx="70"
                cy="70"
                r="58"
                fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 58}`}
                initial={{ strokeDashoffset: `${2 * Math.PI * 58}` }}
                animate={{
                  strokeDashoffset: `${2 * Math.PI * 58 * (1 - overallPercent / 100)}`,
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-[#4ade80]">{overallPercent}%</span>
              <span className="text-xs text-[#6b8f6b]">завершено</span>
            </div>
          </div>
          <p className="text-sm text-[#6b8f6b] mt-3 text-center">
            {completedLessons} из {totalLessons} уроков
          </p>
        </div>

        {/* Course bars */}
        <div className="md:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="text-xs font-semibold text-[#a8c8a8] uppercase tracking-wider mb-4">
            По курсам
          </h3>
          {courseStats.length === 0 ? (
            <p className="text-sm text-[#6b8f6b] text-center py-8">Нет курсов</p>
          ) : (
            <div className="space-y-5">
              {courseStats.map((course) => (
                <div key={course.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#e8f5e8]">{course.title}</p>
                    <span className="text-xs text-[#6b8f6b]">
                      {course.completed}/{course.total}
                    </span>
                  </div>
                  <div className="h-2 bg-[rgba(74,222,128,0.08)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.percent}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="h-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] rounded-full"
                    />
                  </div>
                  {/* Module sub-bars */}
                  <div className="pl-2 space-y-1 mt-1">
                    {course.modules.map((mod) => (
                      <div key={mod.id} className="flex items-center gap-2">
                        <span className="text-[10px] text-[#6b8f6b] w-32 truncate">{mod.title}</span>
                        <div className="flex-1 h-1 bg-[rgba(74,222,128,0.06)] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${mod.percent}%` }}
                            transition={{ duration: 0.6 }}
                            className="h-full bg-[rgba(74,222,128,0.4)] rounded-full"
                          />
                        </div>
                        <span className="text-[10px] text-[#3d5c3d] w-6 text-right">
                          {mod.percent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Activity grid */}
      <motion.div variants={item} className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-[#a8c8a8] uppercase tracking-wider">
            Активность за год
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-[#6b8f6b]">
            <span>Меньше</span>
            <div className="flex gap-0.5">
              {["bg-[rgba(74,222,128,0.06)]", "bg-[rgba(74,222,128,0.2)]", "bg-[rgba(74,222,128,0.4)]", "bg-[rgba(74,222,128,0.65)]", "bg-[#4ade80]"].map(
                (c, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
                )
              )}
            </div>
            <span>Больше</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {/* Month labels */}
          <div className="flex gap-0.5 mb-1 pl-6">
            {monthLabels().map((m) => (
              <div
                key={`${m.label}-${m.colIndex}`}
                className="text-[9px] text-[#6b8f6b]"
                style={{ minWidth: "1.5rem" }}
              >
                {m.label}
              </div>
            ))}
          </div>
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {["Пн", "", "Ср", "", "Пт", "", "Вс"].map((d, i) => (
                <div key={i} className="text-[9px] text-[#6b8f6b] h-3 flex items-center">
                  {d}
                </div>
              ))}
            </div>
            {/* Grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.count} урок(а)`}
                    className={`w-3 h-3 rounded-sm ${getActivityColor(day.count)} cursor-default`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      {/* Certificates */}
      {certificates.length > 0 && (
        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <h3 className="text-xs font-semibold text-[#a8c8a8] uppercase tracking-wider mb-4">
            🏆 Сертификаты
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certificates.map((cert) => (
              <div key={cert.id}
                className="flex items-center gap-3 p-4 rounded-xl border border-[rgba(251,191,36,0.2)] bg-[rgba(251,191,36,0.05)]">
                <Award size={24} className="text-[#fbbf24] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#e8f5e8]">{cert.courseTitle}</p>
                  <p className="text-xs text-[#6b8f6b]">
                    {new Date(cert.issuedAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
