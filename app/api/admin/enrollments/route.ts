import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  const enrollments = await prisma.courseEnrollment.findMany({
    where: courseId ? { courseId } : undefined,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
      course: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(enrollments);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { userId, courseId } = body;

  if (!userId || !courseId)
    return NextResponse.json({ error: "userId and courseId required" }, { status: 400 });

  const enrollment = await prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId },
  });
  return NextResponse.json(enrollment, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const courseId = searchParams.get("courseId");

  if (!userId || !courseId)
    return NextResponse.json({ error: "userId and courseId required" }, { status: 400 });

  await prisma.courseEnrollment.delete({
    where: { userId_courseId: { userId, courseId } },
  });
  return NextResponse.json({ ok: true });
}
