import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, BookOpen, Calendar, Layers, ArrowRight } from "lucide-react";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return null;

  const [userCount, courseCount, eventCount, groupCount] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.event.count(),
    prisma.group.count(),
  ]);

  const sections = [
    {
      href: "/admin/students",
      label: "Студенты",
      desc: "Управление пользователями и группами",
      icon: Users,
      count: userCount,
      unit: "пользователей",
    },
    {
      href: "/admin/courses",
      label: "Курсы",
      desc: "Создание и редактирование курсов",
      icon: BookOpen,
      count: courseCount,
      unit: "курсов",
    },
    {
      href: "/admin/events",
      label: "События",
      desc: "Вебинары, воркшопы и дедлайны",
      icon: Calendar,
      count: eventCount,
      unit: "событий",
    },
    {
      href: "/admin/groups",
      label: "Группы",
      desc: "Учебные группы и Telegram-чаты",
      icon: Layers,
      count: groupCount,
      unit: "групп",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-[#e8f5e8]"
          style={{ fontFamily: "var(--font-unbounded)" }}
        >
          Администрирование
        </h1>
        <p className="text-sm text-[#6b8f6b] mt-1">
          Управление платформой MAESTRO
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href}>
              <div className="glass-card rounded-2xl p-6 hover:border-[rgba(74,222,128,0.3)] transition-all duration-200 group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(74,222,128,0.1)] flex items-center justify-center">
                      <Icon size={18} className="text-[#4ade80]" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-[#e8f5e8]">{s.label}</h2>
                      <p className="text-xs text-[#6b8f6b]">{s.desc}</p>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-[#3d5c3d] group-hover:text-[#4ade80] transition-colors mt-1"
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-[rgba(74,222,128,0.08)]">
                  <span className="text-2xl font-bold text-[#4ade80]">{s.count}</span>
                  <span className="text-xs text-[#6b8f6b] ml-2">{s.unit}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
