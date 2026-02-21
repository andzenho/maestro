"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Plus, Trash2, Edit2, Users, ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface AdminGroup {
  id: string;
  name: string;
  slug: string;
  telegramChatUrl?: string | null;
  userCount: number;
}

const defaultForm = { name: "", slug: "", telegramChatUrl: "" };

export function AdminGroupsClient({ groups: initialGroups }: { groups: AdminGroup[] }) {
  const [groups, setGroups] = useState(initialGroups);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm(defaultForm);
    setEditId(null);
    setOpen(true);
  };

  const openEdit = (g: AdminGroup) => {
    setForm({ name: g.name, slug: g.slug, telegramChatUrl: g.telegramChatUrl || "" });
    setEditId(g.id);
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const res = editId
      ? await fetch(`/api/groups/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      : await fetch("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      if (editId) {
        setGroups(groups.map((g) => (g.id === editId ? { ...g, ...data } : g)));
      } else {
        setGroups([{ ...data, userCount: 0 }, ...groups]);
      }
      setOpen(false);
      toast.success(editId ? "Группа обновлена" : "Группа создана");
    }
  };

  const deleteGroup = async (id: string) => {
    const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
    if (res.ok) {
      setGroups(groups.filter((g) => g.id !== id));
      toast.success("Группа удалена");
    }
  };

  const slugify = (name: string) =>
    name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#e8f5e8]"
            style={{ fontFamily: "var(--font-unbounded)" }}
          >
            Группы
          </h1>
          <p className="text-sm text-[#6b8f6b] mt-1">Учебные группы</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#4ade80] text-[#070d07] hover:bg-[#22c55e]"
        >
          <Plus size={16} className="mr-2" />
          Создать группу
        </Button>
      </div>

      <div className="space-y-3">
        {groups.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Layers size={40} className="text-[#3d5c3d] mx-auto mb-3" />
            <p className="text-[#6b8f6b]">Групп нет</p>
          </div>
        )}
        {groups.map((g) => (
          <div key={g.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[rgba(74,222,128,0.1)] flex items-center justify-center shrink-0">
              <Layers size={16} className="text-[#4ade80]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e8f5e8]">{g.name}</p>
              <p className="text-xs text-[#6b8f6b]">/{g.slug}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6b8f6b]">
              <Users size={12} className="text-[#4ade80]" />
              {g.userCount}
            </div>
            {g.telegramChatUrl && (
              <a
                href={g.telegramChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6b8f6b] hover:text-[#4ade80]"
              >
                <ExternalLink size={14} />
              </a>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEdit(g)}
                className="p-1.5 text-[#6b8f6b] hover:text-[#4ade80] transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => deleteGroup(g.id)}
                className="p-1.5 text-[#6b8f6b] hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0d1a0d] border-[rgba(74,222,128,0.2)] text-[#e8f5e8]">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-unbounded)" }}>
              {editId ? "Редактировать группу" : "Новая группа"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#6b8f6b]">Название</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm({ ...form, name, slug: !editId ? slugify(name) : form.slug });
                }}
                className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8]"
                placeholder="Группа 1"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[#6b8f6b]">Slug (URL)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8]"
                placeholder="gruppa-1"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[#6b8f6b]">Telegram-чат URL</Label>
              <Input
                value={form.telegramChatUrl}
                onChange={(e) => setForm({ ...form, telegramChatUrl: e.target.value })}
                className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8]"
                placeholder="https://t.me/..."
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
