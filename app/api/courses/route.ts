import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      modules: {
        include: {
          lessons: { where: { isPublished: true }, orderBy: { order: "asc" } },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const course = await prisma.course.create({
    data: {
      title: body.title,
      description: body.description,
      order: body.order || 0,
      isPublished: body.isPublished || false,
    },
  });
  return NextResponse.json(course, { status: 201 });
}
