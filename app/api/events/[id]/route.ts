import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  // Check if recording was just added (for Telegram notification)
  const existing = await prisma.event.findUnique({ where: { id }, select: { recordingUrl: true, notifiedRecord: true } });
  const recordingAdded = body.recordingUrl && !existing?.recordingUrl && !existing?.notifiedRecord;

  const event = await prisma.event.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      type: body.type,
      courseId: body.courseId || null,
      startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
      meetingUrl: body.meetingUrl || null,
      recordingUrl: body.recordingUrl || null,
      isPublished: body.isPublished,
      notifyTelegram: body.notifyTelegram,
      // Reset notification flags if date changes significantly
    },
  });

  // Notify Telegram about recording
  if (recordingAdded && event.notifyTelegram) {
    try {
      await notifyRecording(event);
      await prisma.event.update({ where: { id }, data: { notifiedRecord: true } });
    } catch (err) {
      console.error("Telegram notify error:", err);
    }
  }

  return NextResponse.json(event);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

async function notifyRecording(event: { title: string; recordingUrl?: string | null }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token === "your-telegram-bot-token") return;

  const { prisma: db } = await import("@/lib/prisma");
  const users = await db.user.findMany({
    where: { telegramId: { not: null } },
    select: { telegramId: true },
  });

  const msg = `🎬 Запись вебинара доступна!\n\n*${event.title}*\n\n📹 [Смотреть запись](${event.recordingUrl})`;

  for (const user of users) {
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: user.telegramId,
          text: msg,
          parse_mode: "Markdown",
        }),
      });
    } catch {}
  }
}
