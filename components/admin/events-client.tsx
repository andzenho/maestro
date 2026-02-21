"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, Trash2, Edit2, Bell, BellOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface AdminEvent {
  id: string;
  title: string;
  type: string;
  startsAt: string;
  endsAt?: string | null;
  meetingUrl?: string | null;
  recordingUrl?: string | null;
  description?: string | null;
  notifyTelegram: boolean;
}

const typeColors: Record<string, string> = {
  WEBINAR: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  QA: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  WORKSHOP: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DEADLINE: "bg-red-500/20 text-red-400 border-red-500/30",
};

const typeLabels: Record<string, string> = {
  WEBINAR: "Вебинар",
  QA: "Q&A",
  WORKSHOP: "Воркшоп",
  DEADLINE: "Дедлайн",
};

const defaultForm = {
  title: "",
  type: "WEBINAR",
  startsAt: "",
  endsAt: "",
  meetingUrl: "",
  recordingUrl: "",
  description: "",
  notifyTelegram: true,
};

export function AdminEventsClient({ events: initialEvents }: { events: AdminEvent[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm(defaultForm);
    setEditId(null);
    setOpen(true);
  };

  const openEdit = (e: AdminEvent) => {
    setForm({
      title: e.title,
      type: e.type,
      startsAt: e.startsAt.slice(0, 16),
      endsAt: e.endsAt?.slice(0, 16) || "",
      meetingUrl: e.meetingUrl || "",
      recordingUrl: e.recordingUrl || "",
      description: e.description || "",
      notifyTelegram: e.notifyTelegram,
    });
    setEditId(e.id);
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.startsAt) return;
    setSaving(true);
    const body = {
      ...form,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
    };

    const res = editId
      ? await fetch(`/api/events/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      if (editId) {
        setEvents(events.map((e) => (e.id === editId ? { ...e, ...data } : e)));
      } else {
        setEvents([data, ...events]);
      }
      setOpen(false);
      toast.success(editId ? "Событие обновлено" : "Событие создано");
    }
  };

  const deleteEvent = async (id: string) => {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEvents(events.filter((e) => e.id !== id));
      toast.success("Событие удалено");
    }
  };

  const sendNotify = async (id: string) => {
    const res = await fetch(`/api/events/${id}/notify`, { method: "POST" });
    if (res.ok) toast.success("Уведомление отправлено");
    else toast.error("Ошибка отправки");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#e8f5e8]"
            style={{ fontFamily: "var(--font-unbounded)" }}
          >
            События
          </h1>
          <p className="text-sm text-[#6b8f6b] mt-1">
            Управление расписанием
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#4ade80] text-[#070d07] hover:bg-[#22c55e]"
        >
          <Plus size={16} className="mr-2" />
          Создать событие
        </Button>
      </div>

      <div className="space-y-3">
        {events.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Calendar size={40} className="text-[#3d5c3d] mx-auto mb-3" />
            <p className="text-[#6b8f6b]">Нет событий</p>
          </div>
        )}
        {events.map((event) => (
          <div
            key={event.id}
            className="glass-card rounded-xl p-4 flex items-center gap-4"
          >
            <Badge className={`text-xs border shrink-0 ${typeColors[event.type] || ""}`}>
              {typeLabels[event.type] || event.type}
            </Badge>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e8f5e8] truncate">{event.title}</p>
              <p className="text-xs text-[#6b8f6b]">
                {new Date(event.startsAt).toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => sendNotify(event.id)}
                title="Отправить уведомление"
                className="p-1.5 text-[#6b8f6b] hover:text-[#4ade80] transition-colors"
              >
                <Send size={14} />
              </button>
              {event.notifyTelegram ? (
                <Bell size={14} className="text-[#4ade80]" />
              ) : (
                <BellOff size={14} className="text-[#3d5c3d]" />
              )}
              <button
                onClick={() => openEdit(event)}
                className="p-1.5 text-[#6b8f6b] hover:text-[#4ade80] transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => deleteEvent(event.id)}
                className="p-1.5 text-[#6b8f6b] hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0d1a0d] border-[rgba(74,222,128,0.2)] text-[#e8f5e8] max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-unbounded)" }}>
              {editId ? "Редактировать событие" : "Новое событие"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#6b8f6b]">Название</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#6b8f6b]">Тип</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1a0d] border-[rgba(74,222,128,0.2)]">
                    {Object.entries(typeLabels).map(([v, l]) => (
                      <SelectItem key={v} value={v} className="text-[#e8f5e8] focus:bg-[rgba(74,222,128,0.1)]">
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#6b8f6b]">Уведомлять в Telegram</Label>
                <Select
                  value={form.notifyTelegram ? "yes" : "no"}
                  onValueChange={(v) => setForm({ ...form, notifyTelegram: v === "yes" })}
                >
                  <SelectTrigger className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1a0d] border-[rgba(74,222,128,0.2)]">
                    <SelectItem value="yes" className="text-[#e8f5e8] focus:bg-[rgba(74,222,128,0.1)]">Да</SelectItem>
                    <SelectItem value="no" className="text-[#e8f5e8] focus:bg-[rgba(74,222,128,0.1)]">Нет</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#6b8f6b]">Начало</Label>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#6b8f6b]">Конец</Label>
                <Input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[#6b8f6b]">Ссылка на встречу</Label>
              <Input
                value={form.meetingUrl}
                onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
                placeholder="https://zoom.us/..."
                className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[#6b8f6b]">Ссылка на запись</Label>
              <Input
                value={form.recordingUrl}
                onChange={(e) => setForm({ ...form, recordingUrl: e.target.value })}
                placeholder="https://..."
                className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[#6b8f6b]">Описание</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8] resize-none"
                rows={3}
              />
            </div>
            <Button
              onClick={save}
              disabled={saving}
              className="w-full bg-[#4ade80] text-[#070d07] hover:bg-[#22c55e]"
            >
              {saving ? "Сохранение..." : editId ? "Обновить" : "Создать"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
