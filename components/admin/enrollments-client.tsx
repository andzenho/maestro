"use client";

import { useState } from "react";
import { Plus, Trash2, Users, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EnrollmentItem {
  id: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  course: { id: string; title: string };
}

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CourseItem {
  id: string;
  title: string;
}

export function EnrollmentsClient({
  initialEnrollments,
  users,
  courses,
}: {
  initialEnrollments: EnrollmentItem[];
  users: UserItem[];
  courses: CourseItem[];
}) {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const addEnrollment = async () => {
    if (!selectedUser || !selectedCourse) {
      toast.error("Выберите студента и курс");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, courseId: selectedCourse }),
      });
      if (res.ok) {
        const enrollment = await res.json();
        const user = users.find((u) => u.id === selectedUser)!;
        const course = courses.find((c) => c.id === selectedCourse)!;
        setEnrollments((prev) => [
          { ...enrollment, user, course, createdAt: new Date().toISOString() },
          ...prev,
        ]);
        setSelectedUser("");
        setSelectedCourse("");
        toast.success("Студент зачислен на курс");
      } else {
        const err = await res.json();
        toast.error(err.error || "Ошибка");
      }
    } finally {
      setAdding(false);
    }
  };

  const removeEnrollment = async (userId: string, courseId: string, enrollId: string) => {
    setRemoving(enrollId);
    try {
      const res = await fetch(`/api/admin/enrollments?userId=${userId}&courseId=${courseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEnrollments((prev) => prev.filter((e) => e.id !== enrollId));
        toast.success("Зачисление удалено");
      }
    } finally {
      setRemoving(null);
    }
  };

  const filtered = enrollments.filter((e) =>
    `${e.user.firstName} ${e.user.lastName} ${e.user.email} ${e.course.title}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const inputStyle = {
    background: "rgba(74,222,128,0.05)",
    border: "1px solid rgba(74,222,128,0.12)",
    color: "#e8f5e8",
    borderRadius: 10,
  } as React.CSSProperties;

  return (
    <div className="space-y-5">
      {/* Add enrollment */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <p className="text-sm font-semibold text-[#a8c8a8]">Зачислить студента</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#6b8f6b] block mb-1.5">Студент</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full h-10 px-3 text-sm outline-none focus:ring-1 focus:ring-[rgba(74,222,128,0.4)]"
              style={inputStyle}
            >
              <option value="">Выберите студента...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6b8f6b] block mb-1.5">Курс</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full h-10 px-3 text-sm outline-none focus:ring-1 focus:ring-[rgba(74,222,128,0.4)]"
              style={inputStyle}
            >
              <option value="">Выберите курс...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={addEnrollment}
          disabled={adding || !selectedUser || !selectedCourse}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" }}
        >
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Зачислить
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8f6b]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по студентам и курсам..."
          className="w-full h-10 pl-9 pr-4 text-sm rounded-xl outline-none focus:ring-1 focus:ring-[rgba(74,222,128,0.4)]"
          style={inputStyle}
        />
      </div>

      {/* Enrollments list */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Users size={36} className="text-[#3d5c3d] mx-auto mb-3" />
          <p className="text-[#6b8f6b]">
            {search ? "Ничего не найдено" : "Нет зачислений"}
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(74,222,128,0.08)]">
                <th className="text-left p-4 text-xs font-semibold text-[#6b8f6b] uppercase tracking-wider">Студент</th>
                <th className="text-left p-4 text-xs font-semibold text-[#6b8f6b] uppercase tracking-wider">Курс</th>
                <th className="text-left p-4 text-xs font-semibold text-[#6b8f6b] uppercase tracking-wider">Дата</th>
                <th className="p-4 w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={e.id}
                  className={`border-b border-[rgba(74,222,128,0.04)] ${i % 2 === 0 ? "" : "bg-[rgba(74,222,128,0.01)]"}`}>
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium text-[#e8f5e8]">{e.user.firstName} {e.user.lastName}</p>
                      <p className="text-xs text-[#6b8f6b]">{e.user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-[#a8c8a8]">{e.course.title}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-[#6b8f6b]">
                      {new Date(e.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => removeEnrollment(e.user.id, e.course.id, e.id)}
                      disabled={removing === e.id}
                      className="p-1.5 rounded-lg transition-colors text-[#3d5c3d] hover:text-[#f87171]"
                    >
                      {removing === e.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
