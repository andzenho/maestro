import { prisma } from "@/lib/prisma";
import { AdminEventsClient } from "@/components/admin/events-client";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "desc" },
  });

  return (
    <AdminEventsClient
      events={events.map((e) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt?.toISOString(),
        meetingUrl: e.meetingUrl,
        recordingUrl: e.recordingUrl,
        description: e.description,
        notifyTelegram: e.notifyTelegram,
      }))}
    />
  );
}
