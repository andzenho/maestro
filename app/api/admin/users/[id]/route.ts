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

  const updateData: Record<string, any> = {};
  if (body.role) updateData.role = body.role;
  if ("groupId" in body) updateData.groupId = body.groupId;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ id: user.id, role: user.role, groupId: user.groupId });
}
