import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const module_ = await prisma.module.create({
    data: {
      courseId: body.courseId,
      title: body.title,
      description: body.description,
      order: body.order ?? 0,
    },
  });
  return NextResponse.json(module_, { status: 201 });
}
