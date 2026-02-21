"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      toast.error("Неверный email или пароль");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Logo */}
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

      {/* Form card */}
      <div className="glass-card rounded-2xl p-8 space-y-6">
        <div>
          <h2
            className="text-lg font-semibold text-[#e8f5e8]"
            style={{ fontFamily: "var(--font-unbounded)" }}
          >
            Вход в аккаунт
          </h2>
          <p className="text-sm text-[#6b8f6b] mt-1">
            Войдите, чтобы продолжить обучение
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                placeholder="••••••••"
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#4ade80] text-[#070d07] font-semibold hover:bg-[#22c55e] transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#070d07]/30 border-t-[#070d07] rounded-full animate-spin" />
                Вход...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={16} />
                Войти
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-[#6b8f6b]">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-[#4ade80] hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
