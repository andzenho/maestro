"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, MessageCircle, Edit2, Save, Plus, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface OnboardingLink {
  id: string;
  title: string;
  url: string;
  order: number;
}

interface OnboardingClientProps {
  links: OnboardingLink[];
  group: { name: string; telegramChatUrl?: string | null } | null;
  isAdmin: boolean;
}

export function OnboardingClient({ links: initialLinks, group, isAdmin }: OnboardingClientProps) {
  const [links, setLinks] = useState(initialLinks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", url: "" });
  const [addingNew, setAddingNew] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [saving, setSaving] = useState(false);

  const startEdit = (link: OnboardingLink) => {
    setEditingId(link.id);
    setEditForm({ title: link.title, url: link.url });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    const res = await fetch(`/api/onboarding/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setSaving(false);
    if (res.ok) {
      setLinks(links.map((l) => (l.id === id ? { ...l, ...editForm } : l)));
      setEditingId(null);
      toast.success("Ссылка обновлена");
    } else {
      toast.error("Ошибка при сохранении");
    }
  };

  const deleteLink = async (id: string) => {
    const res = await fetch(`/api/onboarding/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLinks(links.filter((l) => l.id !== id));
      toast.success("Ссылка удалена");
    }
  };

  const addLink = async () => {
    if (!newLink.title || !newLink.url) return;
    setSaving(true);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newLink, order: links.length }),
    });
    setSaving(false);
    if (res.ok) {
      const created = await res.json();
      setLinks([...links, created]);
      setNewLink({ title: "", url: "" });
      setAddingNew(false);
      toast.success("Ссылка добавлена");
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-2xl mx-auto space-y-6"
    >
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[rgba(74,222,128,0.15)] flex items-center justify-center">
            <Layers size={20} className="text-[#4ade80]" />
          </div>
          <div>
            <h1
              className="text-xl font-bold text-[#e8f5e8]"
              style={{ fontFamily: "var(--font-unbounded)" }}
            >
              Онбординг
            </h1>
            <p className="text-sm text-[#6b8f6b]">
              Все необходимые ссылки для начала обучения
            </p>
          </div>
        </div>
      </motion.div>

      {/* Group Telegram */}
      {group?.telegramChatUrl && (
        <motion.div
          variants={item}
          className="glass-card rounded-2xl p-5 border border-[rgba(74,222,128,0.2)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(74,222,128,0.15)] flex items-center justify-center">
              <MessageCircle size={20} className="text-[#4ade80]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#e8f5e8]">
                Telegram-группа: {group.name}
              </p>
              <p className="text-xs text-[#6b8f6b]">
                Основной чат вашей учебной группы
              </p>
            </div>
            <a
              href={group.telegramChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[rgba(74,222,128,0.15)] text-[#4ade80] rounded-lg text-sm hover:bg-[rgba(74,222,128,0.25)] transition-colors border border-[rgba(74,222,128,0.2)]"
            >
              Войти <ExternalLink size={14} />
            </a>
          </div>
        </motion.div>
      )}

      {/* Links list */}
      <motion.div variants={item} className="glass-card rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-[#a8c8a8] uppercase tracking-wider">
            Полезные ресурсы
          </h2>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setAddingNew(true)}
              className="h-8 bg-[rgba(74,222,128,0.15)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.25)] border border-[rgba(74,222,128,0.2)]"
            >
              <Plus size={14} className="mr-1" /> Добавить
            </Button>
          )}
        </div>

        {links.length === 0 && !addingNew && (
          <p className="text-sm text-[#6b8f6b] text-center py-8">
            Ссылки ещё не добавлены
          </p>
        )}

        {links.map((link) => (
          <div
            key={link.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(74,222,128,0.05)] border border-[rgba(74,222,128,0.08)] hover:border-[rgba(74,222,128,0.2)] transition-colors group"
          >
            {editingId === link.id ? (
              <div className="flex-1 flex gap-2">
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Название"
                  className="h-8 text-sm bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.2)] text-[#e8f5e8]"
                />
                <Input
                  value={editForm.url}
                  onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                  placeholder="URL"
                  className="h-8 text-sm bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.2)] text-[#e8f5e8]"
                />
                <Button
                  size="sm"
                  onClick={() => saveEdit(link.id)}
                  disabled={saving}
                  className="h-8 bg-[#4ade80] text-[#070d07] hover:bg-[#22c55e]"
                >
                  <Save size={12} />
                </Button>
              </div>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-[rgba(74,222,128,0.1)] flex items-center justify-center shrink-0">
                  <ExternalLink size={14} className="text-[#4ade80]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#e8f5e8] truncate">
                    {link.title}
                  </p>
                  <p className="text-xs text-[#6b8f6b] truncate">{link.url}</p>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(74,222,128,0.1)] text-[#4ade80] rounded-lg text-xs hover:bg-[rgba(74,222,128,0.2)] transition-colors"
                  >
                    Открыть <ExternalLink size={11} />
                  </a>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => startEdit(link)}
                        className="p-1.5 text-[#6b8f6b] hover:text-[#4ade80] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="p-1.5 text-[#6b8f6b] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add new form */}
        {addingNew && (
          <div className="flex gap-2 p-3 rounded-xl bg-[rgba(74,222,128,0.05)] border border-[rgba(74,222,128,0.2)]">
            <Input
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
              placeholder="Название ресурса"
              className="h-9 text-sm bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.2)] text-[#e8f5e8]"
            />
            <Input
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="https://..."
              className="h-9 text-sm bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.2)] text-[#e8f5e8]"
            />
            <Button
              size="sm"
              onClick={addLink}
              disabled={saving}
              className="h-9 bg-[#4ade80] text-[#070d07] hover:bg-[#22c55e]"
            >
              <Save size={14} />
            </Button>
            <Button
              size="sm"
              onClick={() => setAddingNew(false)}
              className="h-9 bg-transparent border border-[rgba(74,222,128,0.2)] text-[#6b8f6b] hover:text-[#e8f5e8]"
            >
              ✕
            </Button>
          </div>
        )}
      </motion.div>

      {/* Welcome note */}
      <motion.div
        variants={item}
        className="rounded-2xl p-6 border border-[rgba(74,222,128,0.15)] bg-gradient-to-br from-[rgba(74,222,128,0.05)] to-transparent"
      >
        <h3
          className="font-semibold text-[#4ade80] mb-2"
          style={{ fontFamily: "var(--font-unbounded)" }}
        >
          Добро пожаловать в MAESTRO
        </h3>
        <p className="text-sm text-[#6b8f6b] leading-relaxed">
          Здесь ты найдёшь все необходимые материалы для начала обучения.
          Присоединяйся к Telegram-чату, изучай курсы и следи за расписанием событий.
          Если возникнут вопросы — задавай их на Q&A сессиях.
        </p>
      </motion.div>
    </motion.div>
  );
}
