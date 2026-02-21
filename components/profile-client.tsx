"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, MessageCircle, Copy, Check, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ProfileUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  telegramId?: string | null;
  telegramCode?: string | null;
  avatarUrl?: string | null;
  group?: { name: string } | null;
}

export function ProfileClient({ user: initialUser }: { user: ProfileUser }) {
  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
  });
  const [saving, setSaving] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  const roleLabels: Record<string, string> = {
    STUDENT: "Студент",
    ADMIN: "Администратор",
    CURATOR: "Куратор",
  };

  const saveProfile = async () => {
    setSaving(true);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      setUser({ ...user, ...updated });
      setEditing(false);
      toast.success("Профиль обновлён");
    } else {
      toast.error("Ошибка при сохранении");
    }
  };

  const generateTelegramCode = async () => {
    setGeneratingCode(true);
    const res = await fetch("/api/users/me/telegram-code", { method: "POST" });
    setGeneratingCode(false);
    if (res.ok) {
      const data = await res.json();
      setUser({ ...user, telegramCode: data.code });
      toast.success("Код сгенерирован");
    }
  };

  const copyCode = () => {
    if (user.telegramCode) {
      navigator.clipboard.writeText(`/start ${user.telegramCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Команда скопирована");
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
        <h1
          className="text-2xl font-bold text-[#e8f5e8]"
          style={{ fontFamily: "var(--font-unbounded)" }}
        >
          Профиль
        </h1>
        <p className="text-sm text-[#6b8f6b] mt-1">
          Управление аккаунтом и настройки
        </p>
      </motion.div>

      {/* Avatar + basic info */}
      <motion.div variants={item} className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-[rgba(74,222,128,0.3)]">
            <AvatarFallback className="bg-[rgba(74,222,128,0.15)] text-[#4ade80] text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-[#e8f5e8]">
              {user.firstName} {user.lastName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-[rgba(74,222,128,0.1)] text-[#4ade80] border-[rgba(74,222,128,0.2)] text-xs">
                {roleLabels[user.role] || user.role}
              </Badge>
              {user.group && (
                <Badge className="bg-[rgba(74,222,128,0.05)] text-[#6b8f6b] border-[rgba(74,222,128,0.1)] text-xs">
                  {user.group.name}
                </Badge>
              )}
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => (editing ? saveProfile() : setEditing(true))}
            disabled={saving}
            className="ml-auto h-8 bg-[rgba(74,222,128,0.15)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.25)] border border-[rgba(74,222,128,0.2)]"
          >
            {saving ? "Сохранение..." : editing ? "Сохранить" : "Редактировать"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#6b8f6b]">Имя</Label>
              {editing ? (
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="h-9 bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8] text-sm"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#e8f5e8]">
                  <User size={13} className="text-[#4ade80]" />
                  {user.firstName}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[#6b8f6b]">Фамилия</Label>
              {editing ? (
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="h-9 bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8] text-sm"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#e8f5e8]">
                  <User size={13} className="text-[#4ade80]" />
                  {user.lastName}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-[#6b8f6b]">Email</Label>
            <div className="flex items-center gap-2 text-sm text-[#e8f5e8]">
              <Mail size={13} className="text-[#4ade80]" />
              {user.email}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-[#6b8f6b]">Роль</Label>
            <div className="flex items-center gap-2 text-sm text-[#e8f5e8]">
              <Shield size={13} className="text-[#4ade80]" />
              {roleLabels[user.role] || user.role}
            </div>
          </div>
        </div>

        {editing && (
          <Button
            size="sm"
            onClick={() => setEditing(false)}
            className="mt-4 h-8 bg-transparent border border-[rgba(74,222,128,0.1)] text-[#6b8f6b] hover:text-[#e8f5e8]"
          >
            Отмена
          </Button>
        )}
      </motion.div>

      {/* Telegram linking */}
      <motion.div variants={item} className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[rgba(74,222,128,0.1)] flex items-center justify-center">
            <MessageCircle size={18} className="text-[#4ade80]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#e8f5e8]">Telegram</h3>
            <p className="text-xs text-[#6b8f6b]">
              {user.telegramId
                ? `Привязан (ID: ${user.telegramId})`
                : "Не привязан"}
            </p>
          </div>
          {user.telegramId && (
            <Badge className="ml-auto bg-[rgba(74,222,128,0.1)] text-[#4ade80] border-[rgba(74,222,128,0.2)]">
              Активен
            </Badge>
          )}
        </div>

        {!user.telegramId && (
          <div className="space-y-3">
            <p className="text-sm text-[#6b8f6b]">
              Привяжи Telegram-аккаунт для получения уведомлений о событиях и новых уроках.
            </p>
            <div className="rounded-xl bg-[rgba(74,222,128,0.05)] border border-[rgba(74,222,128,0.1)] p-4 space-y-3">
              <p className="text-xs font-semibold text-[#a8c8a8] uppercase tracking-wider">
                Как привязать:
              </p>
              <ol className="text-sm text-[#6b8f6b] space-y-1.5 list-decimal list-inside">
                <li>Нажмите «Получить код» ниже</li>
                <li>Скопируйте команду</li>
                <li>Отправьте её боту @maestro_edu_bot</li>
              </ol>
              {user.telegramCode ? (
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-[#4ade80] bg-[rgba(74,222,128,0.1)] px-3 py-2 rounded-lg font-mono">
                    /start {user.telegramCode}
                  </code>
                  <Button
                    size="sm"
                    onClick={copyCode}
                    className="h-9 bg-[rgba(74,222,128,0.15)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.25)] border border-[rgba(74,222,128,0.2)]"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </Button>
                </div>
              ) : null}
            </div>
            <Button
              onClick={generateTelegramCode}
              disabled={generatingCode}
              className="w-full h-10 bg-[rgba(74,222,128,0.15)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.25)] border border-[rgba(74,222,128,0.2)]"
            >
              {generatingCode ? (
                <RefreshCw size={15} className="animate-spin mr-2" />
              ) : (
                <MessageCircle size={15} className="mr-2" />
              )}
              {user.telegramCode ? "Обновить код" : "Получить код"}
            </Button>
          </div>
        )}

        {user.telegramId && (
          <div className="rounded-xl bg-[rgba(74,222,128,0.05)] border border-[rgba(74,222,128,0.1)] p-3">
            <p className="text-sm text-[#6b8f6b]">
              Ты будешь получать уведомления о событиях, новых уроках и записях вебинаров.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
