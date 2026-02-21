import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingClient } from "@/components/onboarding-client";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { group: true },
  });

  const links = await prisma.onboardingLink.findMany({
    orderBy: { order: "asc" },
  });

  const isAdmin = user?.role === "ADMIN";

  return (
    <OnboardingClient
      links={links.map((l) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        order: l.order,
      }))}
      group={user?.group ? { name: user.group.name, telegramChatUrl: user.group.telegramChatUrl } : null}
      isAdmin={isAdmin}
    />
  );
}
