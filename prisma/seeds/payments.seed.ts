import { PrismaClient, PaymentStatus } from '@prisma/client';

const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'Yape', 'Plin', 'Tarjeta'];

interface PaymentOptions {
  paymentCompletionRate: number;
}

export async function seedPayments(
  prisma: PrismaClient,
  options: PaymentOptions = { paymentCompletionRate: 0.85 }
) {
  console.log('[ ] Seeding payments...');

  const enrollments = await prisma.enrollment.findMany({
    where: { status: 'ACTIVE' },
    include: { course: true },
  });

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  for (const enrollment of enrollments) {
    const { studentId, course, enrollmentDate } = enrollment;

    // Generar pagos mensuales desde la matrícula hasta hoy
    const today = new Date();
    const currentDate = new Date(enrollmentDate);

    while (currentDate <= today) {
      const dueDate = new Date(currentDate);
      dueDate.setDate(5); // Vencimiento el día 5 de cada mes

      // Determinar estado del pago según config
      let status: PaymentStatus;
      const isOverdue = dueDate < today;

      if (isOverdue) {
        const overdueRate = 1 - options.paymentCompletionRate;
        status = Math.random() > overdueRate ? 'PAID' : 'OVERDUE';
      } else {
        status = Math.random() < 0.7 ? 'PAID' : 'PENDING';
      }

      const paymentDate =
        status === 'PAID'
          ? new Date(dueDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000) // Pagado hasta 10 días después
          : new Date();

      const receiptNumber =
        status === 'PAID'
          ? `REC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
          : null;

      await prisma.payment.create({
        data: {
          studentId,
          amount: course.monthlyPrice,
          concept: `Mensualidad ${course.name} - ${currentDate.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}`,
          paymentDate: status === 'PAID' ? paymentDate : new Date(),
          dueDate,
          status,
          paymentMethod:
            status === 'PAID'
              ? PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)]
              : null,
          receiptNumber,
          recordedBy: admin?.id,
        },
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  const count = await prisma.payment.count();
  console.log(`[ ] Created ${count} payments`);
}
