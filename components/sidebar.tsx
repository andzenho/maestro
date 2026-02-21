"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Calendar, BarChart3,
  User, LogOut, Settings, Layers, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/",           label: "Дашборд",   icon: LayoutDashboard },
  { href: "/onboarding", label: "Онбординг", icon: Layers },
  { href: "/courses",    label: "Курсы",     icon: BookOpen },
  { href: "/calendar",   label: "Календарь", icon: Calendar },
  { href: "/progress",   label: "Прогресс",  icon: BarChart3 },
  { href: "/profile",    label: "Профиль",   icon: User },
];

const adminNav = [
  { href: "/admin", label: "Управление", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = session?.user?.role === "ADMIN";
  const name = session?.user?.name ?? "";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 68 : 228 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen overflow-hidden flex-shrink-0"
      style={{ background: "var(--surface-1)", borderRight: "1px solid var(--border-1)" }}
    >
      {/* Logo */}
      <div className="flex items-center h-[60px] px-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-1)" }}>
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.span key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-gradient text-[17px] font-black" style={{ fontFamily: "var(--font-unbounded)" }}>
              M
            </motion.span>
          ) : (
            <motion.span key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-gradient text-[17px] font-black tracking-[0.16em] whitespace-nowrap"
              style={{ fontFamily: "var(--font-unbounded)" }}>
              MAESTRO
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-[2px]">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: active ? 0 : 2 }}
                transition={{ duration: 0.12 }}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-[9px] rounded-[10px] cursor-pointer transition-colors duration-150"
                )}
                style={active ? {
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent-border)",
                  color: "#c4b8ff",
                } : {
                  color: "var(--text-3)",
                  border: "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
                  }
                }}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full"
                    style={{ background: "var(--accent)" }} />
                )}
                <Icon size={15} className="shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[13px] font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-5 pb-2 px-3">
              {!collapsed ? (
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-3)" }}>
                  Администратор
                </span>
              ) : (
                <div className="h-px mx-1" style={{ background: "var(--border-1)" }} />
              )}
            </div>
            {adminNav.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href}>
                  <motion.div
                    whileHover={{ x: active ? 0 : 2 }}
                    className="relative flex items-center gap-3 px-3 py-[9px] rounded-[10px] cursor-pointer transition-colors duration-150"
                    style={active ? {
                      background: "var(--accent-dim)",
                      border: "1px solid var(--accent-border)",
                      color: "#c4b8ff",
                    } : {
                      color: "var(--text-3)",
                      border: "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                        (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
                      }
                    }}
                  >
                    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full" style={{ background: "var(--accent)" }} />}
                    <Icon size={15} className="shrink-0" strokeWidth={1.8} />
                    {!collapsed && <span className="text-[13px] font-medium whitespace-nowrap">{label}</span>}
                  </motion.div>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: "1px solid var(--border-1)" }}>
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-[10px]"
          style={{ background: "var(--surface-2)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ background: "linear-gradient(135deg,#7b61ff,#5533dd)", color: "#fff" }}>
            {initials}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-[12px] font-medium truncate" style={{ color: "var(--text-1)" }}>{name}</p>
                <p className="text-[10px] truncate" style={{ color: "var(--text-3)" }}>{session?.user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1 rounded transition-colors shrink-0"
              style={{ color: "var(--text-3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}>
              <LogOut size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Toggle */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] z-20 flex h-6 w-6 items-center justify-center rounded-full"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", color: "var(--text-3)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
          (e.currentTarget as HTMLElement).style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)";
          (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
        }}>
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>
    </motion.aside>
  );
}
