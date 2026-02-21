import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { group: true },
  });

  if (!user) return NextResponse.json(null);
  const { passwordHash: _pw, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
    },
  });

  return NextResponse.json({
    firstName: user.firstName,
    lastName: user.lastName,
  });
}
