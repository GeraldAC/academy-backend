// src/modules/payments/controllers/paymentController.ts
import { Request, Response } from 'express';
import * as paymentService from './payments.service';

export const createPayment = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.id;
    const { studentId, amount, concept, dueDate, paymentMethod, notes, status } = req.body;

    const payment = await paymentService.createPayment({
      studentId,
      amount,
      concept,
      dueDate,
      paymentMethod,
      notes,
      status,
      recordedBy: adminId,
    });

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Pago registrado exitosamente',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error al registrar el pago',
    });
  }
};

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const { status, studentId, startDate, endDate } = req.query;

    const payments = await paymentService.getAllPayments({
      status: status as string,
      studentId: studentId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener los pagos',
    });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPaymentById(id);

    res.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error al obtener el pago',
    });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const payment = await paymentService.updatePayment(id, data);

    res.json({
      success: true,
      data: payment,
      message: 'Pago actualizado exitosamente',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error al actualizar el pago',
    });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await paymentService.deletePayment(id);

    res.json({
      success: true,
      message: 'Pago eliminado exitosamente',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error al eliminar el pago',
    });
  }
};

export const getMyPayments = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.id;
    const payments = await paymentService.getStudentPayments(studentId);

    res.json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener tus pagos',
    });
  }
};
