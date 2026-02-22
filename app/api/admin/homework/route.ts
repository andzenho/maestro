import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "SUBMITTED";

  const homework = await prisma.homework.findMany({
    where: { status: status as "PENDING" | "SUBMITTED" | "REVIEWED" | "REVISION" },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
      lesson: {
        select: {
          id: true,
          title: true,
          module: { select: { title: true, course: { select: { title: true } } } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(homework);
}
