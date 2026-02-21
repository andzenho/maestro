import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "@/components/profile-client";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { group: true },
  });

  if (!user) return null;

  return (
    <ProfileClient
      user={{
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        telegramId: user.telegramId,
        telegramCode: user.telegramCode,
        avatarUrl: user.avatarUrl,
        group: user.group ? { name: user.group.name } : null,
      }}
    />
  );
}
