import { PrismaClient, WeekDay } from '@prisma/client';

const WEEK_DAYS: WeekDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const TIME_SLOTS = [
  { start: '08:00:00', end: '10:00:00' },
  { start: '10:00:00', end: '12:00:00' },
  { start: '14:00:00', end: '16:00:00' },
  { start: '16:00:00', end: '18:00:00' },
];

const CLASSROOMS = ['A101', 'A102', 'B201', 'B202', 'C301', 'Lab-1', 'Lab-2'];

export async function seedSchedules(prisma: PrismaClient) {
  console.log('[ ] Seeding schedules...');

  const courses = await prisma.course.findMany({
    where: { isActive: true },
  });

  for (const course of courses) {
    // Cada curso tiene 2-3 sesiones por semana
    const sessionsPerWeek = Math.random() > 0.5 ? 2 : 3;
    const selectedDays = WEEK_DAYS.sort(() => Math.random() - 0.5).slice(0, sessionsPerWeek);

    for (const day of selectedDays) {
      const timeSlot = TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];
      const classroom = CLASSROOMS[Math.floor(Math.random() * CLASSROOMS.length)];

      await prisma.schedule.create({
        data: {
          courseId: course.id,
          weekDay: day,
          startTime: new Date(`1970-01-01T${timeSlot.start}`),
          endTime: new Date(`1970-01-01T${timeSlot.end}`),
          classroom,
          classType: 'REGULAR',
          isActive: true,
        },
      });
    }
  }

  const count = await prisma.schedule.count();
  console.log(`[ ] Created ${count} schedules`);
}
