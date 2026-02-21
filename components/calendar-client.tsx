"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Calendar, ExternalLink, Video, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Dynamic import to avoid SSR issues
const FullCalendar = dynamic(() => import("@fullcalendar/react").then(m => m.default), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center text-[#6b8f6b]">
      Загрузка календаря...
    </div>
  ),
});

import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  startsAt: string;
  endsAt?: string | null;
  meetingUrl?: string | null;
  recordingUrl?: string | null;
  description?: string | null;
}

interface CalendarClientProps {
  events: CalendarEvent[];
}

const typeConfig: Record<string, { color: string; bg: string; label: string }> = {
  WEBINAR: { color: "#60a5fa", bg: "rgba(96,165,250,0.2)", label: "Вебинар" },
  QA: { color: "#a78bfa", bg: "rgba(167,139,250,0.2)", label: "Q&A" },
  WORKSHOP: { color: "#fb923c", bg: "rgba(251,146,60,0.2)", label: "Воркшоп" },
  DEADLINE: { color: "#f87171", bg: "rgba(248,113,113,0.2)", label: "Дедлайн" },
};

const badgeColors: Record<string, string> = {
  WEBINAR: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  QA: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  WORKSHOP: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DEADLINE: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function CalendarClient({ events }: CalendarClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const calEvents = events.map((e) => {
    const cfg = typeConfig[e.type] || typeConfig.WEBINAR;
    return {
      id: e.id,
      title: e.title,
      start: e.startsAt,
      end: e.endsAt || undefined,
      backgroundColor: cfg.bg,
      borderColor: cfg.color,
      textColor: cfg.color,
      extendedProps: e,
    };
  });

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps as CalendarEvent);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Upcoming events
  const upcoming = events
    .filter((e) => new Date(e.startsAt) >= new Date())
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#e8f5e8]"
            style={{ fontFamily: "var(--font-unbounded)" }}
          >
            Календарь
          </h1>
          <p className="text-sm text-[#6b8f6b] mt-1">
            Расписание вебинаров, воркшопов и Q&A сессий
          </p>
        </div>
        {/* Legend */}
        <div className="hidden md:flex items-center gap-3">
          {Object.entries(typeConfig).map(([type, cfg]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: cfg.color }}
              />
              <span className="text-xs text-[#6b8f6b]">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="ru"
            events={calEvents}
            eventClick={handleEventClick}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek",
            }}
            height="auto"
            buttonText={{ today: "Сегодня", month: "Месяц", week: "Неделя" }}
          />
        </div>

        {/* Upcoming events */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#a8c8a8] uppercase tracking-wider">
            Ближайшие события
          </h3>
          {upcoming.length === 0 ? (
            <div className="glass-card rounded-xl p-4 text-center">
              <Calendar size={24} className="text-[#3d5c3d] mx-auto mb-2" />
              <p className="text-xs text-[#6b8f6b]">Нет предстоящих событий</p>
            </div>
          ) : (
            upcoming.map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ scale: 1.02 }}
                className="glass-card rounded-xl p-3 cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-[10px] border ${badgeColors[event.type] || ""}`}>
                    {typeConfig[event.type]?.label || event.type}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-[#e8f5e8] truncate">
                  {event.title}
                </p>
                <p className="text-xs text-[#6b8f6b] mt-1">
                  {formatDate(event.startsAt)}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 max-w-md w-full border border-[rgba(74,222,128,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <Badge
                className={`text-xs border ${badgeColors[selectedEvent.type] || ""}`}
              >
                {typeConfig[selectedEvent.type]?.label || selectedEvent.type}
              </Badge>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-[#6b8f6b] hover:text-[#e8f5e8]"
              >
                <X size={18} />
              </button>
            </div>

            <h2 className="text-lg font-semibold text-[#e8f5e8] mb-2">
              {selectedEvent.title}
            </h2>

            {selectedEvent.description && (
              <p className="text-sm text-[#6b8f6b] mb-3">
                {selectedEvent.description}
              </p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[#a8c8a8]">
                <Calendar size={14} className="text-[#4ade80]" />
                <span>{formatDate(selectedEvent.startsAt)}</span>
              </div>
              {selectedEvent.endsAt && (
                <p className="text-xs text-[#6b8f6b] ml-5">
                  до {formatDate(selectedEvent.endsAt)}
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              {selectedEvent.meetingUrl && (
                <a
                  href={selectedEvent.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#4ade80] text-[#070d07] rounded-xl text-sm font-semibold hover:bg-[#22c55e] transition-colors"
                >
                  <ExternalLink size={14} />
                  Присоединиться
                </a>
              )}
              {selectedEvent.recordingUrl && (
                <a
                  href={selectedEvent.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[rgba(74,222,128,0.1)] text-[#4ade80] rounded-xl text-sm border border-[rgba(74,222,128,0.2)] hover:bg-[rgba(74,222,128,0.2)] transition-colors"
                >
                  <Video size={14} />
                  Запись
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
