import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEventNotification } from "@/lib/telegram";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const typeLabels: Record<string, string> = {
    WEBINAR: "Вебинар",
    QA: "Q&A",
    WORKSHOP: "Воркшоп",
    DEADLINE: "Дедлайн",
  };

  const startDate = event.startsAt.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const message = `📢 <b>${typeLabels[event.type] || event.type}: ${event.title}</b>\n\n🕐 ${startDate}${
    event.meetingUrl ? `\n\n🔗 <a href="${event.meetingUrl}">Ссылка на встречу</a>` : ""
  }`;

  await sendEventNotification(message);

  return NextResponse.json({ ok: true });
}
