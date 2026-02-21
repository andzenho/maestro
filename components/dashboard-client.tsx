"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Calendar, CheckCircle2, Clock, PlayCircle, TrendingUp, Zap, ArrowRight } from "lucide-react";

interface DashboardProps {
  user: any;
  totalLessons: number;
  completedLessons: number;
  nextEvent: { id: string; title: string; type: string; startsAt: string; meetingUrl?: string | null } | null;
  recentProgress: { lessonId: string; lessonTitle: string; courseTitle: string; isCompleted: boolean; lastWatchedAt: string }[];
  courseStats: { id: string; title: string; total: number; completed: number; percent: number }[];
  userName: string;
}

const eventColors: Record<string, { pill: string; dot: string }> = {
  WEBINAR:  { pill: "pill-blue",   dot: "#60a5fa" },
  QA:       { pill: "pill-violet", dot: "#a78bfa" },
  WORKSHOP: { pill: "pill-amber",  dot: "#f59e0b" },
  DEADLINE: { pill: "pill-red",    dot: "#f87171" },
};
const eventLabels: Record<string, string> = { WEBINAR:"Вебинар", QA:"Q&A", WORKSHOP:"Воркшоп", DEADLINE:"Дедлайн" };

const fade = { hidden: { opacity:0, y:14 }, show: { opacity:1, y:0 } };
const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };

export function DashboardClient({ user, totalLessons, completedLessons, nextEvent, recentProgress, courseStats, userName }: DashboardProps) {
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const r = 48, circ = 2 * Math.PI * r;

  const until = (d: string) => {
    const h = Math.floor((new Date(d).getTime() - Date.now()) / 3600000);
    const days = Math.floor(h / 24);
    return days > 0 ? `через ${days} дн.` : h > 0 ? `через ${h} ч.` : "скоро";
  };
  const fmtDate = (d: string) =>
    new Date(d).toLocaleString("ru-RU", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <motion.div variants={fade} className="flex items-end justify-between">
        <div>
          <p className="text-[13px] mb-1" style={{ color:"var(--text-3)" }}>
            {new Date().toLocaleDateString("ru-RU", { weekday:"long", day:"numeric", month:"long" })}
          </p>
          <h1 className="text-[22px] font-bold" style={{ fontFamily:"var(--font-unbounded)", color:"var(--text-1)" }}>
            Привет, {userName.split(" ")[0]} 👋
          </h1>
          {user?.group && (
            <p className="text-[13px] mt-1" style={{ color:"var(--text-3)" }}>
              Группа: <span style={{ color:"var(--accent)" }}>{user.group.name}</span>
            </p>
          )}
        </div>
        <Link href="/courses"
          className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-[10px] transition-all"
          style={{ background:"var(--accent-dim)", color:"#c4b8ff", border:"1px solid var(--accent-border)" }}>
          Перейти к курсам <ArrowRight size={14} />
        </Link>
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div variants={fade} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:"Пройдено уроков", value:completedLessons, icon:CheckCircle2, color:"var(--green)",   bg:"rgba(52,211,153,0.1)" },
          { label:"Всего уроков",    value:totalLessons,     icon:BookOpen,     color:"#60a5fa",        bg:"rgba(96,165,250,0.1)" },
          { label:"Прогресс",        value:`${pct}%`,        icon:TrendingUp,   color:"var(--accent)",  bg:"var(--accent-dim)" },
          { label:"Активных курсов", value:courseStats.filter(c=>c.completed>0).length, icon:Zap, color:"var(--amber)", bg:"var(--amber-dim)" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="surface p-4 flex items-center gap-3"
              style={{ borderRadius:14 }}>
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background:s.bg }}>
                <Icon size={16} style={{ color:s.color }} />
              </div>
              <div>
                <p className="text-[20px] font-bold leading-tight" style={{ color:"var(--text-1)" }}>{s.value}</p>
                <p className="text-[11px] leading-tight" style={{ color:"var(--text-3)" }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ── Middle row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Ring */}
        <motion.div variants={fade} className="surface p-6 flex flex-col items-center justify-center gap-3" style={{ borderRadius:16 }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color:"var(--text-3)" }}>Общий прогресс</p>
          <div className="relative w-[112px] h-[112px]">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="10"/>
              <motion.circle
                cx="55" cy="55" r={r} fill="none"
                stroke="url(#vgrad)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
                transition={{ duration:1.2, ease:"easeOut" }}
              />
              <defs>
                <linearGradient id="vgrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#b39eff"/>
                  <stop offset="100%" stopColor="#7b61ff"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[26px] font-black text-gradient">{pct}%</span>
              <span className="text-[10px]" style={{ color:"var(--text-3)" }}>завершено</span>
            </div>
          </div>
          <p className="text-[12px]" style={{ color:"var(--text-3)" }}>
            {completedLessons} из {totalLessons} уроков
          </p>
        </motion.div>

        {/* Next event */}
        <motion.div variants={fade} className="surface p-5 flex flex-col gap-3" style={{ borderRadius:16 }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color:"var(--text-3)" }}>Следующее событие</p>
          {nextEvent ? (
            <>
              <span className={`pill ${eventColors[nextEvent.type]?.pill || "pill-violet"} w-fit`}>
                <span className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: eventColors[nextEvent.type]?.dot }} />
                {eventLabels[nextEvent.type] || nextEvent.type}
              </span>
              <p className="text-[14px] font-semibold leading-snug" style={{ color:"var(--text-1)" }}>
                {nextEvent.title}
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[12px]" style={{ color:"var(--text-3)" }}>
                  <Calendar size={12}/> {fmtDate(nextEvent.startsAt)}
                </div>
                <div className="flex items-center gap-2 text-[12px] font-medium" style={{ color:"var(--accent)" }}>
                  <Clock size={12}/> {until(nextEvent.startsAt)}
                </div>
              </div>
              {nextEvent.meetingUrl && (
                <a href={nextEvent.meetingUrl} target="_blank" rel="noopener noreferrer"
                  className="mt-auto flex items-center justify-center gap-2 py-2 rounded-[10px] text-[12px] font-semibold transition-all"
                  style={{ background:"var(--accent)", color:"#fff" }}>
                  Присоединиться <ArrowRight size={12}/>
                </a>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
              <Calendar size={28} style={{ color:"var(--text-3)", opacity:0.5 }} />
              <p className="text-[13px]" style={{ color:"var(--text-3)" }}>Нет событий</p>
              <Link href="/calendar" className="text-[12px]" style={{ color:"var(--accent)" }}>Открыть календарь →</Link>
            </div>
          )}
        </motion.div>

        {/* Recent */}
        <motion.div variants={fade} className="surface p-5 flex flex-col gap-3" style={{ borderRadius:16 }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color:"var(--text-3)" }}>Последняя активность</p>
          {recentProgress.length > 0 ? (
            <div className="space-y-2">
              {recentProgress.map(p => (
                <div key={p.lessonId} className="flex items-center gap-3 p-2 rounded-[8px] transition-colors"
                  style={{ background:"var(--surface-2)" }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: p.isCompleted ? "rgba(52,211,153,0.15)" : "var(--surface-3)" }}>
                    {p.isCompleted
                      ? <CheckCircle2 size={10} style={{ color:"var(--green)" }}/>
                      : <PlayCircle size={10} style={{ color:"var(--text-3)" }}/>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium truncate" style={{ color:"var(--text-1)" }}>{p.lessonTitle}</p>
                    <p className="text-[10px] truncate" style={{ color:"var(--text-3)" }}>{p.courseTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
              <PlayCircle size={28} style={{ color:"var(--text-3)", opacity:0.5 }} />
              <p className="text-[13px]" style={{ color:"var(--text-3)" }}>Ещё нет активности</p>
              <Link href="/courses" className="text-[12px]" style={{ color:"var(--accent)" }}>Начать обучение →</Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Course progress ── */}
      {courseStats.length > 0 && (
        <motion.div variants={fade} className="surface p-6" style={{ borderRadius:16 }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color:"var(--text-3)" }}>
              Прогресс по курсам
            </p>
            <Link href="/courses" className="text-[12px]" style={{ color:"var(--accent)" }}>Все курсы →</Link>
          </div>
          <div className="space-y-4">
            {courseStats.map(c => (
              <div key={c.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium" style={{ color:"var(--text-1)" }}>{c.title}</span>
                  <span className="text-[12px]" style={{ color:"var(--text-3)" }}>{c.completed}/{c.total}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"var(--surface-3)" }}>
                  <motion.div
                    initial={{ width:0 }} animate={{ width:`${c.percent}%` }}
                    transition={{ duration:0.9, ease:"easeOut" }}
                    className="h-full rounded-full"
                    style={{ background:"linear-gradient(90deg,#7b61ff,#b39eff)" }}
                  />
                </div>
                <p className="text-[11px]" style={{ color:"var(--accent)" }}>{c.percent}%</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
