import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const note = await prisma.userNote.findFirst({
    where: { userId: session.user.id, lessonId: id },
  });
  return NextResponse.json(note);
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const userId = session.user.id;

  const existing = await prisma.userNote.findFirst({
    where: { userId, lessonId: id },
  });

  let note;
  if (existing) {
    note = await prisma.userNote.update({
      where: { id: existing.id },
      data: { text: body.text },
    });
  } else {
    note = await prisma.userNote.create({
      data: { userId, lessonId: id, text: body.text },
    });
  }
  return NextResponse.json(note);
}
