// src/modules/payments/services/paymentService.ts
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { AppError } from '../../utils/errors';

const prisma = new PrismaClient();

interface CreatePaymentDto {
  studentId: string;
  amount: number;
  concept: string;
  dueDate?: Date;
  paymentMethod?: string;
  notes?: string;
  status?: PaymentStatus;
  recordedBy: string;
}

interface UpdatePaymentDto {
  amount?: number;
  concept?: string;
  dueDate?: Date;
  status?: PaymentStatus;
  paymentMethod?: string;
  receiptNumber?: string;
  notes?: string;
}

interface PaymentFilters {
  status?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}

export const createPayment = async (data: CreatePaymentDto) => {
  const { studentId, amount, concept, dueDate, paymentMethod, notes, status, recordedBy } = data;

  // Validar que el estudiante existe
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student || student.role !== 'STUDENT') {
    throw new AppError('Estudiante no encontrado', 404);
  }

  // Generar número de recibo si el pago está marcado como PAID
  let receiptNumber: string | undefined;
  if (status === 'PAID') {
    const count = await prisma.payment.count();
    receiptNumber = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }

  const payment = await prisma.payment.create({
    data: {
      studentId,
      amount,
      concept,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      paymentMethod,
      notes,
      status: status || 'PENDING',
      receiptNumber,
      recordedBy,
    },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          dni: true,
        },
      },
      recorder: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return payment;
};

export const getAllPayments = async (filters: PaymentFilters) => {
  const { status, studentId, startDate, endDate } = filters;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (studentId) {
    where.studentId = studentId;
  }

  if (startDate || endDate) {
    where.paymentDate = {};
    if (startDate) {
      where.paymentDate.gte = new Date(startDate);
    }
    if (endDate) {
      where.paymentDate.lte = new Date(endDate);
    }
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          dni: true,
        },
      },
      recorder: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      paymentDate: 'desc',
    },
  });

  return payments;
};

export const getPaymentById = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          dni: true,
        },
      },
      recorder: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!payment) {
    throw new AppError('Pago no encontrado', 404);
  }

  return payment;
};

export const updatePayment = async (paymentId: string, data: UpdatePaymentDto) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new AppError('Pago no encontrado', 404);
  }

  // Si se cambia a PAID y no tiene receiptNumber, generarlo
  let receiptNumber = data.receiptNumber;
  if (data.status === 'PAID' && !payment.receiptNumber && !receiptNumber) {
    const count = await prisma.payment.count();
    receiptNumber = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      ...data,
      receiptNumber,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          dni: true,
        },
      },
      recorder: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return updated;
};

export const deletePayment = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new AppError('Pago no encontrado', 404);
  }

  await prisma.payment.delete({
    where: { id: paymentId },
  });
};

export const getStudentPayments = async (studentId: string) => {
  const payments = await prisma.payment.findMany({
    where: { studentId },
    orderBy: {
      paymentDate: 'desc',
    },
  });

  return payments;
};
