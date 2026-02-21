import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123456", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@maestro.ru" },
    update: {},
    create: {
      firstName: "Администратор",
      lastName: "MAESTRO",
      email: "admin@maestro.ru",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin created:", admin.email);

  // Demo group
  const group = await prisma.group.upsert({
    where: { slug: "gruppa-1" },
    update: {},
    create: {
      name: "Группа 1",
      slug: "gruppa-1",
      telegramChatUrl: "https://t.me/example",
    },
  });

  console.log("✅ Group created:", group.name);

  // Demo course
  const course = await prisma.course.upsert({
    where: { id: "demo-course" },
    update: {},
    create: {
      id: "demo-course",
      title: "Основы продюсирования",
      description: "Базовый курс по музыкальному продюсированию",
      order: 1,
      isPublished: true,
    },
  });

  const module1 = await prisma.module.upsert({
    where: { id: "demo-module-1" },
    update: {},
    create: {
      id: "demo-module-1",
      courseId: course.id,
      title: "Введение",
      order: 1,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "demo-lesson-1" },
    update: {},
    create: {
      id: "demo-lesson-1",
      moduleId: module1.id,
      title: "Что такое продюсирование",
      description: "Обзор профессии и основных инструментов",
      order: 1,
      isPublished: true,
      duration: 600,
    },
  });

  console.log("✅ Demo course created:", course.title);

  // Demo event
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);

  await prisma.event.upsert({
    where: { id: "demo-event-1" },
    update: {},
    create: {
      id: "demo-event-1",
      title: "Вводный вебинар",
      description: "Знакомство с платформой и преподавателями",
      type: "WEBINAR",
      startsAt: tomorrow,
      meetingUrl: "https://zoom.us/example",
      notifyTelegram: true,
    },
  });

  console.log("✅ Demo event created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
