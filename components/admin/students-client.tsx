"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, MessageCircle, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface StudentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  telegramId?: string | null;
  group?: { id: string; name: string } | null;
  createdAt: string;
}

interface AdminStudentsClientProps {
  users: StudentUser[];
  groups: { id: string; name: string }[];
}

const roleLabels: Record<string, string> = {
  STUDENT: "Студент",
  ADMIN: "Адм.",
  CURATOR: "Куратор",
};

const roleColors: Record<string, string> = {
  STUDENT: "bg-[rgba(74,222,128,0.1)] text-[#4ade80] border-[rgba(74,222,128,0.2)]",
  ADMIN: "bg-[rgba(248,113,113,0.1)] text-red-400 border-red-500/20",
  CURATOR: "bg-[rgba(167,139,250,0.1)] text-purple-400 border-purple-500/20",
};

export function AdminStudentsClient({ users: initialUsers, groups }: AdminStudentsClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const changeRole = async (userId: string, role: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role } : u)));
      toast.success("Роль обновлена");
    }
  };

  const changeGroup = async (userId: string, groupId: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: groupId === "none" ? null : groupId }),
    });
    if (res.ok) {
      const group = groups.find((g) => g.id === groupId);
      setUsers(
        users.map((u) =>
          u.id === userId
            ? { ...u, group: groupId !== "none" && group ? { id: group.id, name: group.name } : null }
            : u
        )
      );
      toast.success("Группа обновлена");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#e8f5e8]"
            style={{ fontFamily: "var(--font-unbounded)" }}
          >
            Студенты
          </h1>
          <p className="text-sm text-[#6b8f6b] mt-1">
            Всего: {users.length} пользователей
          </p>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени или email..."
          className="pl-9 bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8] placeholder:text-[#3d5c3d]"
        />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(74,222,128,0.08)]">
              {["Пользователь", "Email", "Роль", "Группа", "Telegram"].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs text-[#6b8f6b] uppercase tracking-wider px-4 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="border-b border-[rgba(74,222,128,0.04)] hover:bg-[rgba(74,222,128,0.03)] transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[rgba(74,222,128,0.1)] flex items-center justify-center text-[10px] text-[#4ade80] font-semibold">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <span className="text-sm text-[#e8f5e8]">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[#6b8f6b]">{user.email}</td>
                <td className="px-4 py-3">
                  <Select
                    defaultValue={user.role}
                    onValueChange={(v) => changeRole(user.id, v)}
                  >
                    <SelectTrigger className="h-7 w-28 bg-transparent border-[rgba(74,222,128,0.1)] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1a0d] border-[rgba(74,222,128,0.2)]">
                      {["STUDENT", "CURATOR", "ADMIN"].map((r) => (
                        <SelectItem key={r} value={r} className="text-xs text-[#e8f5e8] focus:bg-[rgba(74,222,128,0.1)]">
                          {roleLabels[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Select
                    defaultValue={user.group?.id || "none"}
                    onValueChange={(v) => changeGroup(user.id, v)}
                  >
                    <SelectTrigger className="h-7 w-32 bg-transparent border-[rgba(74,222,128,0.1)] text-xs">
                      <SelectValue placeholder="Без группы" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1a0d] border-[rgba(74,222,128,0.2)]">
                      <SelectItem value="none" className="text-xs text-[#6b8f6b] focus:bg-[rgba(74,222,128,0.1)]">
                        Без группы
                      </SelectItem>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={g.id} className="text-xs text-[#e8f5e8] focus:bg-[rgba(74,222,128,0.1)]">
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  {user.telegramId ? (
                    <MessageCircle size={14} className="text-[#4ade80]" />
                  ) : (
                    <span className="text-xs text-[#3d5c3d]">—</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#6b8f6b]">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Пользователи не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
