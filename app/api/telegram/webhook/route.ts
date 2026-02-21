import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const update = await req.json();
    const message = update.message;

    if (!message?.text || !message?.chat?.id) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const userId = message.from?.id?.toString();

    // /start [code]
    if (text.startsWith("/start")) {
      const parts = text.split(" ");
      const code = parts[1];

      if (code) {
        const user = await prisma.user.findFirst({
          where: { telegramCode: code },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              telegramId: chatId.toString(),
              telegramCode: null,
            },
          });

          await sendMessage(
            chatId,
            `✅ <b>Аккаунт привязан!</b>\n\nПривет, ${user.firstName}! Теперь ты будешь получать уведомления о вебинарах, новых уроках и других событиях.\n\nДоступные команды:\n/schedule — расписание\n/progress — прогресс\n/links — полезные ссылки`
          );
        } else {
          await sendMessage(
            chatId,
            "❌ Неверный код. Получи новый код в профиле на платформе MAESTRO."
          );
        }
      } else {
        await sendMessage(
          chatId,
          "👋 <b>Добро пожаловать в MAESTRO Bot!</b>\n\nДля привязки аккаунта:\n1. Зайди в профиль на платформе\n2. Нажми «Получить код»\n3. Отправь команду /start [код]\n\nДоступные команды:\n/schedule — расписание\n/progress — прогресс\n/links — полезные ссылки"
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Find user by telegramId
    const user = await prisma.user.findFirst({
      where: { telegramId: chatId.toString() },
    });

    // /schedule
    if (text === "/schedule") {
      const events = await prisma.event.findMany({
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 5,
      });

      const typeLabels: Record<string, string> = {
        WEBINAR: "🖥 Вебинар",
        QA: "❓ Q&A",
        WORKSHOP: "🎯 Воркшоп",
        DEADLINE: "⏰ Дедлайн",
      };

      if (events.length === 0) {
        await sendMessage(chatId, "📅 Нет предстоящих событий.");
      } else {
        const lines = events.map((e) => {
          const date = e.startsAt.toLocaleString("ru-RU", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });
          return `${typeLabels[e.type] || e.type}: <b>${e.title}</b>\n📅 ${date}${e.meetingUrl ? `\n🔗 ${e.meetingUrl}` : ""}`;
        });
        await sendMessage(chatId, `📅 <b>Ближайшие события:</b>\n\n${lines.join("\n\n")}`);
      }
      return NextResponse.json({ ok: true });
    }

    // /progress
    if (text === "/progress") {
      if (!user) {
        await sendMessage(chatId, "⚠️ Аккаунт не привязан. Используй /start [код]");
        return NextResponse.json({ ok: true });
      }

      const totalLessons = await prisma.lesson.count({ where: { isPublished: true } });
      const completed = await prisma.lessonProgress.count({
        where: { userId: user.id, isCompleted: true },
      });
      const percent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

      const bar = "█".repeat(Math.floor(percent / 10)) + "░".repeat(10 - Math.floor(percent / 10));
      await sendMessage(
        chatId,
        `📊 <b>Твой прогресс</b>\n\n${bar} ${percent}%\n\n✅ Пройдено: ${completed} из ${totalLessons} уроков`
      );
      return NextResponse.json({ ok: true });
    }

    // /links
    if (text === "/links") {
      const links = await prisma.onboardingLink.findMany({ orderBy: { order: "asc" } });
      if (links.length === 0) {
        await sendMessage(chatId, "🔗 Нет сохранённых ссылок.");
      } else {
        const lines = links.map((l) => `• <a href="${l.url}">${l.title}</a>`);
        await sendMessage(chatId, `🔗 <b>Полезные ссылки:</b>\n\n${lines.join("\n")}`);
      }
      return NextResponse.json({ ok: true });
    }

    // Default
    await sendMessage(
      chatId,
      "Доступные команды:\n/schedule — расписание\n/progress — прогресс\n/links — ссылки"
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
