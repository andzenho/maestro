import { prisma } from "@/lib/prisma";
import { AdminStudentsClient } from "@/components/admin/students-client";

export default async function AdminStudentsPage() {
  const users = await prisma.user.findMany({
    include: { group: true },
    orderBy: { createdAt: "desc" },
  });

  const groups = await prisma.group.findMany({ orderBy: { name: "asc" } });

  return (
    <AdminStudentsClient
      users={users.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        telegramId: u.telegramId,
        group: u.group ? { id: u.group.id, name: u.group.name } : null,
        createdAt: u.createdAt.toISOString(),
      }))}
      groups={groups.map((g) => ({ id: g.id, name: g.name }))}
    />
  );
}
