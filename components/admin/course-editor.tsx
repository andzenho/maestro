"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Plus, Trash2, ChevronDown, ChevronRight, Upload,
  FileVideo, X, Check, Loader2, Eye, EyeOff, ArrowLeft, GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";

interface LessonData {
  id: string; title: string; order: number;
  isPublished: boolean; duration?: number | null; videoUrl?: string | null;
}
interface ModuleData {
  id: string; title: string; order: number; lessons: LessonData[];
}
interface CourseData {
  id: string; title: string; description?: string | null;
  order: number; isPublished: boolean; coverUrl?: string | null;
  modules: ModuleData[];
}

export function CourseEditor({ course }: { course: CourseData | null }) {
  const router = useRouter();
  const isNew = !course;

  const [form, setForm] = useState({
    title: course?.title ?? "",
    description: course?.description ?? "",
    order: course?.order ?? 0,
    isPublished: course?.isPublished ?? false,
  });
  const [modules, setModules] = useState<ModuleData[]>(course?.modules ?? []);
  const [expandedModule, setExpandedModule] = useState<string | null>(modules[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [uploadingLesson, setUploadingLesson] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  /* ── Save course info ── */
  const saveCourse = async () => {
    setSaving(true);
    const method = isNew ? "POST" : "PATCH";
    const url = isNew ? "/api/courses" : `/api/courses/${course!.id}`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      toast.success(isNew ? "Курс создан!" : "Курс сохранён");
      if (isNew) router.push(`/admin/courses/${data.id}`);
    } else toast.error("Ошибка при сохранении");
  };

  /* ── Add module ── */
  const addModule = async () => {
    if (!newModuleTitle.trim() || !course) return;
    const res = await fetch("/api/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course.id, title: newModuleTitle, order: modules.length }),
    });
    if (res.ok) {
      const m = await res.json();
      const newMod: ModuleData = { ...m, lessons: [] };
      setModules([...modules, newMod]);
      setExpandedModule(m.id);
      setNewModuleTitle("");
      setAddingModule(false);
      toast.success("Модуль добавлен");
    }
  };

  /* ── Delete module ── */
  const deleteModule = async (moduleId: string) => {
    if (!confirm("Удалить модуль и все его уроки?")) return;
    const res = await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
    if (res.ok) {
      setModules(modules.filter(m => m.id !== moduleId));
      toast.success("Модуль удалён");
    }
  };

  /* ── Update module title ── */
  const updateModuleTitle = async (moduleId: string, title: string) => {
    await fetch(`/api/modules/${moduleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setModules(modules.map(m => m.id === moduleId ? { ...m, title } : m));
  };

  /* ── Add lesson ── */
  const addLesson = async (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, title: "Новый урок", order: mod.lessons.length }),
    });
    if (res.ok) {
      const lesson = await res.json();
      setModules(modules.map(m =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m
      ));
      toast.success("Урок добавлен");
    }
  };

  /* ── Update lesson ── */
  const updateLesson = async (moduleId: string, lessonId: string, data: Partial<LessonData>) => {
    const res = await fetch(`/api/lessons/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setModules(modules.map(m =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...data } : l) }
          : m
      ));
    }
  };

  /* ── Delete lesson ── */
  const deleteLesson = async (moduleId: string, lessonId: string) => {
    const res = await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
    if (res.ok) {
      setModules(modules.map(m =>
        m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m
      ));
      toast.success("Урок удалён");
    }
  };

  /* ── Upload video ── */
  const uploadVideo = async (lessonId: string, moduleId: string, file: File) => {
    setUploadingLesson(lessonId);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("lessonId", lessonId);
    const res = await fetch("/api/upload/video", { method: "POST", body: fd });
    setUploadingLesson(null);
    if (res.ok) {
      const { url, duration } = await res.json();
      await updateLesson(moduleId, lessonId, { videoUrl: url, duration });
      toast.success("Видео загружено");
    } else {
      toast.error("Ошибка загрузки видео");
    }
  };

  const inputStyle = {
    background: "var(--surface-2)",
    border: "1px solid var(--border-2)",
    color: "var(--text-1)",
    borderRadius: 10,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/courses" className="p-2 rounded-[8px] transition-colors"
          style={{ background: "var(--surface-2)", color: "var(--text-3)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-[18px] font-bold" style={{ fontFamily: "var(--font-unbounded)", color: "var(--text-1)" }}>
            {isNew ? "Новый курс" : form.title || "Редактор курса"}
          </h1>
          <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
            {isNew ? "Заполните данные и сохраните" : `ID: ${course!.id}`}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[9px] text-[12px] font-medium transition-colors"
            style={{
              background: form.isPublished ? "rgba(52,211,153,0.1)" : "var(--surface-2)",
              color: form.isPublished ? "var(--green)" : "var(--text-3)",
              border: `1px solid ${form.isPublished ? "rgba(52,211,153,0.25)" : "var(--border-2)"}`,
            }}>
            {form.isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
            {form.isPublished ? "Опубликован" : "Скрыт"}
          </button>
          <button onClick={saveCourse} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-[9px] text-[13px] font-semibold transition-all"
            style={{ background: "var(--accent)", color: "#fff" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>

      {/* Course info */}
      <div className="surface p-5 space-y-4" style={{ borderRadius: 14 }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--text-3)" }}>
          Основная информация
        </p>
        <div className="space-y-1.5">
          <Label className="text-[12px]" style={{ color: "var(--text-2)" }}>Название курса</Label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Основы продюсирования" style={inputStyle} className="h-[42px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]" style={{ color: "var(--text-2)" }}>Описание</Label>
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Краткое описание курса..." rows={3}
            style={{ ...inputStyle, resize: "none" }} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]" style={{ color: "var(--text-2)" }}>Порядок отображения</Label>
          <Input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: +e.target.value }))}
            style={{ ...inputStyle, width: 100 }} className="h-[42px]" />
        </div>
      </div>

      {/* Modules */}
      {!isNew && (
        <div className="surface p-5 space-y-3" style={{ borderRadius: 14 }}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--text-3)" }}>
              Модули и уроки
            </p>
            <button onClick={() => setAddingModule(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium"
              style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
              <Plus size={13} /> Добавить модуль
            </button>
          </div>

          {/* Add module input */}
          <AnimatePresence>
            {addingModule && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex gap-2 py-1">
                  <Input value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)}
                    placeholder="Название модуля" style={inputStyle} className="h-9"
                    onKeyDown={e => e.key === "Enter" && addModule()} autoFocus />
                  <button onClick={addModule}
                    className="px-3 h-9 rounded-[9px] text-[13px] font-semibold"
                    style={{ background: "var(--accent)", color: "#fff" }}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => { setAddingModule(false); setNewModuleTitle(""); }}
                    className="px-3 h-9 rounded-[9px]"
                    style={{ background: "var(--surface-2)", color: "var(--text-3)" }}>
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {modules.length === 0 && !addingModule && (
            <p className="text-[13px] text-center py-6" style={{ color: "var(--text-3)" }}>
              Добавьте первый модуль
            </p>
          )}

          <div className="space-y-2">
            {modules.map(mod => (
              <div key={mod.id} className="rounded-[12px] overflow-hidden"
                style={{ border: "1px solid var(--border-1)" }}>
                {/* Module header */}
                <div className="flex items-center gap-2 px-4 py-3"
                  style={{ background: "var(--surface-2)" }}>
                  <GripVertical size={14} style={{ color: "var(--text-3)" }} className="cursor-grab" />
                  <button onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                    className="flex items-center gap-2 flex-1 text-left">
                    {expandedModule === mod.id
                      ? <ChevronDown size={14} style={{ color: "var(--accent)" }} />
                      : <ChevronRight size={14} style={{ color: "var(--text-3)" }} />}
                    <ModuleTitle
                      value={mod.title}
                      onBlur={val => val !== mod.title && updateModuleTitle(mod.id, val)}
                    />
                  </button>
                  <span className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: "var(--surface-3)", color: "var(--text-3)" }}>
                    {mod.lessons.length} ур.
                  </span>
                  <button onClick={() => deleteModule(mod.id)}
                    className="p-1.5 rounded-[6px] transition-colors"
                    style={{ color: "var(--text-3)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}>
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Lessons */}
                <AnimatePresence>
                  {expandedModule === mod.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }}
                      exit={{ height: 0 }} className="overflow-hidden">
                      <div className="p-3 space-y-2">
                        {mod.lessons.map(lesson => (
                          <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            uploading={uploadingLesson === lesson.id}
                            onUpdate={data => updateLesson(mod.id, lesson.id, data)}
                            onDelete={() => deleteLesson(mod.id, lesson.id)}
                            onUpload={file => uploadVideo(lesson.id, mod.id, file)}
                            fileInputRef={el => { fileInputRefs.current[lesson.id] = el; }}
                            onClickUpload={() => fileInputRefs.current[lesson.id]?.click()}
                          />
                        ))}
                        <button onClick={() => addLesson(mod.id)}
                          className="w-full py-2 rounded-[9px] flex items-center justify-center gap-2 text-[12px] transition-colors"
                          style={{ border: "1px dashed var(--border-2)", color: "var(--text-3)" }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                            (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)";
                            (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
                          }}>
                          <Plus size={13} /> Добавить урок
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Module title inline edit ── */
function ModuleTitle({ value, onBlur }: { value: string; onBlur: (v: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <input
      value={v}
      onChange={e => setV(e.target.value)}
      onBlur={() => onBlur(v)}
      onClick={e => e.stopPropagation()}
      className="flex-1 bg-transparent text-[13px] font-medium outline-none"
      style={{ color: "var(--text-1)", minWidth: 0 }}
    />
  );
}

/* ── Lesson row ── */
function LessonRow({
  lesson, uploading, onUpdate, onDelete, onUpload, fileInputRef, onClickUpload,
}: {
  lesson: LessonData;
  uploading: boolean;
  onUpdate: (data: Partial<LessonData>) => void;
  onDelete: () => void;
  onUpload: (file: File) => void;
  fileInputRef: (el: HTMLInputElement | null) => void;
  onClickUpload: () => void;
}) {
  const [titleEdit, setTitleEdit] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [expanded, setExpanded] = useState(false);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl ?? "");
  const [duration, setDuration] = useState(lesson.duration ?? 0);

  return (
    <div className="rounded-[10px] overflow-hidden" style={{ border: "1px solid var(--border-1)", background: "var(--surface-1)" }}>
      {/* Main row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button onClick={() => setExpanded(!expanded)} className="p-0.5">
          {expanded
            ? <ChevronDown size={12} style={{ color: "var(--accent)" }} />
            : <ChevronRight size={12} style={{ color: "var(--text-3)" }} />}
        </button>

        {titleEdit ? (
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => { setTitleEdit(false); onUpdate({ title }); }}
            onKeyDown={e => e.key === "Enter" && (setTitleEdit(false), onUpdate({ title }))}
            className="flex-1 text-[12px] bg-transparent outline-none border-b"
            style={{ color: "var(--text-1)", borderColor: "var(--accent)" }}
          />
        ) : (
          <button onClick={() => setTitleEdit(true)}
            className="flex-1 text-left text-[12px] font-medium"
            style={{ color: "var(--text-1)" }}>
            {lesson.title}
          </button>
        )}

        {/* Video indicator */}
        {lesson.videoUrl && (
          <span className="pill pill-violet"><FileVideo size={9} /> Видео</span>
        )}

        {/* Publish toggle */}
        <button
          onClick={() => onUpdate({ isPublished: !lesson.isPublished })}
          className="p-1.5 rounded-[6px] transition-colors"
          style={{ color: lesson.isPublished ? "var(--green)" : "var(--text-3)" }}
          title={lesson.isPublished ? "Скрыть" : "Опубликовать"}>
          {lesson.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>

        <button onClick={onDelete}
          className="p-1.5 rounded-[6px] transition-colors"
          style={{ color: "var(--text-3)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}>
          <Trash2 size={12} />
        </button>
      </div>

      {/* Expanded lesson editor */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-3 pt-1" style={{ borderTop: "1px solid var(--border-1)" }}>
              {/* Video upload */}
              <div>
                <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-3)" }}>
                  Видео
                </label>
                <div className="flex gap-2">
                  <Input
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://... или загрузите файл"
                    className="h-9 flex-1 text-[12px]"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", color: "var(--text-1)", borderRadius: 8 }}
                    onBlur={() => onUpdate({ videoUrl: videoUrl || null })}
                  />
                  <button onClick={onClickUpload} disabled={uploading}
                    className="flex items-center gap-1.5 px-3 h-9 rounded-[8px] text-[12px] font-medium shrink-0 transition-colors"
                    style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
                    {uploading
                      ? <><Loader2 size={12} className="animate-spin" /> Загрузка...</>
                      : <><Upload size={12} /> Файл</>}
                  </button>
                  <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
                    onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-3)" }}>
                  Длительность (сек)
                </label>
                <Input type="number" value={duration}
                  onChange={e => setDuration(+e.target.value)}
                  onBlur={() => onUpdate({ duration: duration || null })}
                  className="h-9 w-28 text-[12px]"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", color: "var(--text-1)", borderRadius: 8 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
