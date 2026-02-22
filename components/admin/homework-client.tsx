"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, MessageSquare, ChevronDown, ChevronUp, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

interface HomeworkItem {
  id: string;
  text: string | null;
  fileUrl: string | null;
  status: string;
  adminComment: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null };
  lesson: {
    id: string;
    title: string;
    module: { title: string; course: { title: string } };
  };
}

export function HomeworkClient({ initialItems }: { initialItems: HomeworkItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"SUBMITTED" | "REVIEWED" | "REVISION">("SUBMITTED");

  const review = async (id: string, status: "REVIEWED" | "REVISION") => {
    setReviewing(id);
    try {
      const res = await fetch(`/api/admin/homework/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminComment: comments[id] || null }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((item) => item.id === id ? { ...item, status, adminComment: comments[id] || null } : item));
        toast.success(status === "REVIEWED" ? "Принято!" : "Отправлено на доработку");
        setExpanded(null);
      }
    } finally {
      setReviewing(null);
    }
  };

  const filtered = items.filter((i) => i.status === filter);

  const statusColors: Record<string, string> = {
    SUBMITTED: "text-[#fbbf24] bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.2)]",
    REVIEWED: "text-[#4ade80] bg-[rgba(74,222,128,0.1)] border-[rgba(74,222,128,0.2)]",
    REVISION: "text-[#f87171] bg-[rgba(248,113,113,0.1)] border-[rgba(248,113,113,0.2)]",
  };
  const statusLabels: Record<string, string> = {
    SUBMITTED: "На проверке",
    REVIEWED: "Принято",
    REVISION: "На доработке",
  };

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["SUBMITTED", "REVIEWED", "REVISION"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-colors border ${
              filter === s
                ? statusColors[s]
                : "border-[rgba(74,222,128,0.08)] text-[#6b8f6b] bg-transparent hover:text-[#a8c8a8]"
            }`}
          >
            {statusLabels[s]}
            <span className="ml-2 text-xs opacity-60">
              {items.filter((i) => i.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Clock size={36} className="text-[#3d5c3d] mx-auto mb-3" />
          <p className="text-[#6b8f6b]">Нет работ в этой категории</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl overflow-hidden">
              {/* Header */}
              <button
                className="w-full flex items-start gap-4 p-5 text-left hover:bg-[rgba(74,222,128,0.02)] transition-colors"
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                <div className="w-9 h-9 rounded-full bg-[rgba(74,222,128,0.1)] flex items-center justify-center shrink-0 text-sm font-bold text-[#4ade80]">
                  {item.user.firstName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-[#e8f5e8] text-sm">
                      {item.user.firstName} {item.user.lastName}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[item.status] || ""}`}>
                      {statusLabels[item.status] || item.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#6b8f6b] truncate">
                    {item.lesson.module.course.title} → {item.lesson.module.title} → {item.lesson.title}
                  </p>
                  {item.text && (
                    <p className="text-sm text-[#a8c8a8] mt-2 line-clamp-2">{item.text}</p>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs text-[#3d5c3d]">
                    {new Date(item.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                  {expanded === item.id ? (
                    <ChevronUp size={16} className="text-[#6b8f6b]" />
                  ) : (
                    <ChevronDown size={16} className="text-[#6b8f6b]" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {expanded === item.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4 border-t border-[rgba(74,222,128,0.08)]">
                      {item.text && (
                        <div className="pt-4">
                          <p className="text-xs text-[#6b8f6b] mb-2">Ответ студента:</p>
                          <div className="bg-[rgba(74,222,128,0.04)] border border-[rgba(74,222,128,0.08)] rounded-xl p-4">
                            <p className="text-sm text-[#e8f5e8] whitespace-pre-wrap">{item.text}</p>
                          </div>
                        </div>
                      )}
                      {item.fileUrl && (
                        <div>
                          <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-[#4ade80] hover:underline">
                            📎 Прикреплённый файл
                          </a>
                        </div>
                      )}
                      {item.adminComment && (
                        <div className="bg-[rgba(74,222,128,0.05)] border border-[rgba(74,222,128,0.12)] rounded-xl p-4">
                          <p className="text-xs text-[#6b8f6b] mb-1">Предыдущий комментарий:</p>
                          <p className="text-sm text-[#e8f5e8]">{item.adminComment}</p>
                        </div>
                      )}

                      {item.status !== "REVIEWED" && (
                        <>
                          <div>
                            <label className="text-xs text-[#6b8f6b] block mb-2">
                              <MessageSquare size={11} className="inline mr-1" />
                              Комментарий (необязательно)
                            </label>
                            <textarea
                              value={comments[item.id] || ""}
                              onChange={(e) => setComments((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              placeholder="Напишите фидбек студенту..."
                              rows={3}
                              className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                              style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.12)", color: "#e8f5e8" }}
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => review(item.id, "REVIEWED")}
                              disabled={reviewing === item.id}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                              style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" }}
                            >
                              {reviewing === item.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                              Принять
                            </button>
                            <button
                              onClick={() => review(item.id, "REVISION")}
                              disabled={reviewing === item.id}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                              style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}
                            >
                              <X size={14} />
                              На доработку
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
