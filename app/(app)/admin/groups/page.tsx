import { prisma } from "@/lib/prisma";
import { AdminGroupsClient } from "@/components/admin/groups-client";

export default async function AdminGroupsPage() {
  const groups = await prisma.group.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminGroupsClient
      groups={groups.map((g) => ({
        id: g.id,
        name: g.name,
        slug: g.slug,
        telegramChatUrl: g.telegramChatUrl,
        userCount: g._count.users,
      }))}
    />
  );
}
