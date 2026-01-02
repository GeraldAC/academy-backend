import { PrismaClient } from '@prisma/client';

const NOTIFICATION_TEMPLATES = [
  {
    title: 'Pago pendiente',
    message: 'Tienes un pago pendiente. Por favor, regulariza tu situación.',
  },
  {
    title: 'Recordatorio de clase',
    message: 'Recuerda que tienes clase mañana. ¡No faltes!',
  },
  {
    title: 'Bienvenido',
    message: 'Bienvenido a la academia. Estamos aquí para ayudarte.',
  },
  {
    title: 'Actualización de horario',
    message: 'Se ha actualizado el horario de uno de tus cursos.',
  },
  {
    title: 'Nueva asignación',
    message: 'Se te ha asignado un nuevo curso.',
  },
  {
    title: 'Pago confirmado',
    message: 'Tu pago ha sido confirmado. Gracias.',
  },
];

export async function seedNotifications(prisma: PrismaClient) {
  console.log('[ ] Seeding notifications...');

  const users = await prisma.user.findMany({
    where: { isActive: true },
  });

  for (const user of users) {
    // Cada usuario recibe 2-5 notificaciones
    const numNotifications = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < numNotifications; i++) {
      const template =
        NOTIFICATION_TEMPLATES[Math.floor(Math.random() * NOTIFICATION_TEMPLATES.length)];

      // 40% leídas, 60% no leídas
      const isRead = Math.random() > 0.6;

      // Notificaciones de los últimos 30 días
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: template.title,
          message: template.message,
          isRead,
          createdAt,
        },
      });
    }
  }

  const count = await prisma.notification.count();
  console.log(`[ ] Created ${count} notifications`);
}
