import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN!;

let bot: TelegramBot | null = null;

export function getBot(): TelegramBot | null {
  if (!token || token === "your-telegram-bot-token") return null;
  if (!bot) {
    bot = new TelegramBot(token);
  }
  return bot;
}

export async function sendMessage(chatId: string | number, text: string): Promise<void> {
  const b = getBot();
  if (!b) return;
  try {
    await b.sendMessage(chatId, text, { parse_mode: "HTML" });
  } catch (e) {
    console.error("Telegram sendMessage error:", e);
  }
}

export async function sendEventNotification(message: string): Promise<void> {
  // Import prisma inline to avoid circular deps
  const { prisma } = await import("./prisma");
  const users = await prisma.user.findMany({
    where: { telegramId: { not: null } },
    select: { telegramId: true },
  });

  await Promise.all(
    users.map((u) => u.telegramId && sendMessage(u.telegramId, message))
  );
}
