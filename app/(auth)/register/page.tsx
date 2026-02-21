"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus } from "lucide-react";

const registerSchema = z.object({
  firstName: z.string().min(2, "Минимум 2 символа"),
  lastName: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
  groupId: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

interface Group {
  id: string;
  name: string;
  slug: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data) => setGroups(data || []))
      .catch(() => {});
  }, []);

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Аккаунт создан! Войдите в систему.");
      router.push("/login");
    } else {
      const err = await res.json();
      toast.error(err.error || "Ошибка при регистрации");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h1
          className="text-4xl font-black tracking-widest text-[#4ade80]"
          style={{ fontFamily: "var(--font-unbounded)" }}
        >
          MAESTRO
        </h1>
        <p className="mt-2 text-[#6b8f6b] text-sm">
          Платформа для обучения продюсированию
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8 space-y-6">
        <div>
          <h2
            className="text-lg font-semibold text-[#e8f5e8]"
            style={{ fontFamily: "var(--font-unbounded)" }}
          >
            Регистрация
          </h2>
          <p className="text-sm text-[#6b8f6b] mt-1">
            Создайте аккаунт и начните обучение
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#a8c8a8] text-sm">Имя</Label>
              <Input
                {...register("firstName")}
                placeholder="Алексей"
                className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8] placeholder:text-[#3d5c3d] focus:border-[#4ade80] h-11"
              />
              {errors.firstName && (
                <p className="text-xs text-red-400">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[#a8c8a8] text-sm">Фамилия</Label>
              <Input
                {...register("lastName")}
                placeholder="Иванов"
                className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8] placeholder:text-[#3d5c3d] focus:border-[#4ade80] h-11"
              />
              {errors.lastName && (
                <p className="text-xs text-red-400">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#a8c8a8] text-sm">Email</Label>
            <Input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8] placeholder:text-[#3d5c3d] focus:border-[#4ade80] h-11"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[#a8c8a8] text-sm">Пароль</Label>
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Минимум 8 символов"
                className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8] placeholder:text-[#3d5c3d] focus:border-[#4ade80] h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8f6b] hover:text-[#4ade80]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {groups.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[#a8c8a8] text-sm">
                Группа (необязательно)
              </Label>
              <Select onValueChange={(v) => setValue("groupId", v)}>
                <SelectTrigger className="bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.15)] text-[#e8f5e8] h-11 focus:border-[#4ade80]">
                  <SelectValue placeholder="Выберите группу" />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1a0d] border-[rgba(74,222,128,0.2)]">
                  {groups.map((g) => (
                    <SelectItem
                      key={g.id}
                      value={g.id}
                      className="text-[#e8f5e8] focus:bg-[rgba(74,222,128,0.1)]"
                    >
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#4ade80] text-[#070d07] font-semibold hover:bg-[#22c55e] transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#070d07]/30 border-t-[#070d07] rounded-full animate-spin" />
                Создание...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus size={16} />
                Создать аккаунт
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-[#6b8f6b]">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-[#4ade80] hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
