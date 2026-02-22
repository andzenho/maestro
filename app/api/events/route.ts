import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { startsAt: "asc" },
    include: { course: { select: { id: true, title: true } } },
  });
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const event = await prisma.event.create({
    data: {
      title: body.title,
      description: body.description,
      type: body.type,
      courseId: body.courseId || null,
      startsAt: new Date(body.startsAt),
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
      meetingUrl: body.meetingUrl || null,
      recordingUrl: body.recordingUrl || null,
      isPublished: body.isPublished ?? true,
      notifyTelegram: body.notifyTelegram ?? true,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
