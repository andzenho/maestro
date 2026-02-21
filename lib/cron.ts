import cron from "node-cron";
import { prisma } from "./prisma";
import { sendMessage } from "./telegram";

const typeLabels: Record<string, string> = {
  WEBINAR: "🖥 Вебинар",
  QA: "❓ Q&A",
  WORKSHOP: "🎯 Воркшоп",
  DEADLINE: "⏰ Дедлайн",
};

async function notifyUsers(message: string) {
  const users = await prisma.user.findMany({
    where: { telegramId: { not: null } },
    select: { telegramId: true },
  });

  await Promise.all(
    users.map((u) => u.telegramId && sendMessage(u.telegramId, message))
  );
}

export function startCronJobs() {
  // Every 5 minutes: check for upcoming events
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();

      // 24 hours notifications
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const events24h = await prisma.event.findMany({
        where: {
          notifyTelegram: true,
          notified24h: false,
          startsAt: {
            gte: new Date(in24h.getTime() - 5 * 60 * 1000),
            lte: new Date(in24h.getTime() + 5 * 60 * 1000),
          },
        },
      });

      for (const event of events24h) {
        const startDate = event.startsAt.toLocaleString("ru-RU", {
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        });
        await notifyUsers(
          `⏰ <b>Напоминание: ${typeLabels[event.type] || event.type}</b>\n\n<b>${event.title}</b>\n📅 ${startDate} (через 24 часа)${
            event.meetingUrl ? `\n\n🔗 <a href="${event.meetingUrl}">Ссылка на встречу</a>` : ""
          }`
        );
        await prisma.event.update({
          where: { id: event.id },
          data: { notified24h: true },
        });
      }

      // 1 hour notifications
      const in1h = new Date(now.getTime() + 60 * 60 * 1000);
      const events1h = await prisma.event.findMany({
        where: {
          notifyTelegram: true,
          notified1h: false,
          startsAt: {
            gte: new Date(in1h.getTime() - 5 * 60 * 1000),
            lte: new Date(in1h.getTime() + 5 * 60 * 1000),
          },
        },
      });

      for (const event of events1h) {
        const startDate = event.startsAt.toLocaleString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        });
        await notifyUsers(
          `🔔 <b>${typeLabels[event.type] || event.type} начинается через 1 час!</b>\n\n<b>${event.title}</b>\n🕐 ${startDate}${
            event.meetingUrl ? `\n\n🔗 <a href="${event.meetingUrl}">Присоединиться</a>` : ""
          }`
        );
        await prisma.event.update({
          where: { id: event.id },
          data: { notified1h: true },
        });
      }

      // Recording available notifications
      const eventsWithRecording = await prisma.event.findMany({
        where: {
          notifiedRecord: false,
          recordingUrl: { not: null },
          startsAt: { lte: now },
        },
      });

      for (const event of eventsWithRecording) {
        await notifyUsers(
          `🎬 <b>Запись доступна: ${event.title}</b>\n\n🔗 <a href="${event.recordingUrl!}">Смотреть запись</a>`
        );
        await prisma.event.update({
          where: { id: event.id },
          data: { notifiedRecord: true },
        });
      }
    } catch (error) {
      console.error("Cron job error:", error);
    }
  });

  console.log("✅ Cron jobs started");
}
