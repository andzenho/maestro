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
  const materials = await prisma.lessonMaterial.findMany({
    where: { lessonId: id },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(materials);
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const count = await prisma.lessonMaterial.count({ where: { lessonId: id } });
  const material = await prisma.lessonMaterial.create({
    data: {
      lessonId: id,
      title: body.title,
      url: body.url,
      fileKey: body.fileKey,
      fileType: body.fileType,
      fileSize: body.fileSize,
      order: body.order ?? count,
    },
  });
  return NextResponse.json(material, { status: 201 });
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: lessonId } = await params;
  const { searchParams } = new URL(req.url);
  const materialId = searchParams.get("materialId");
  if (!materialId)
    return NextResponse.json({ error: "materialId required" }, { status: 400 });

  await prisma.lessonMaterial.delete({ where: { id: materialId } });
  return NextResponse.json({ ok: true });
}
