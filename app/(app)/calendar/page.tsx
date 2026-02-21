import { prisma } from "@/lib/prisma";
import { CalendarClient } from "@/components/calendar-client";

export default async function CalendarPage() {
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "asc" },
  });

  return (
    <CalendarClient
      events={events.map((e) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt?.toISOString(),
        meetingUrl: e.meetingUrl,
        recordingUrl: e.recordingUrl,
        description: e.description,
      }))}
    />
  );
}
