// src/modules/reservations/controllers/reservationController.ts
import { Request, Response } from 'express';
import * as reservationService from './reservations.service';

export const createReservation = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.id;
    const { courseId, classDate, notes } = req.body;

    const reservation = await reservationService.createReservation({
      studentId,
      courseId,
      classDate,
      notes,
    });

    res.status(201).json({
      success: true,
      data: reservation,
      message: 'Reserva creada exitosamente',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error al crear la reserva',
    });
  }
};

export const getMyReservations = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.id;
    const reservations = await reservationService.getStudentReservations(studentId);

    res.json({
      success: true,
      data: reservations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener las reservas',
    });
  }
};

export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const studentId = (req as any).user.id;

    const reservation = await reservationService.cancelReservation(id, studentId);

    res.json({
      success: true,
      data: reservation,
      message: 'Reserva cancelada exitosamente',
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error al cancelar la reserva',
    });
  }
};

export const getTeacherCourseReservations = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const teacherId = (req as any).user.id;

    const reservations = await reservationService.getTeacherCourseReservations(teacherId, courseId);

    res.json({
      success: true,
      data: reservations,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error al obtener las reservas',
    });
  }
};

export const getAllTeacherReservations = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user.id;
    const reservations = await reservationService.getAllTeacherReservations(teacherId);

    res.json({
      success: true,
      data: reservations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener las reservas',
    });
  }
};

export const getAllReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await reservationService.getAllReservations();

    res.json({
      success: true,
      data: reservations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener las reservas',
    });
  }
};

export const getMyEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const enrollments = await reservationService.getStudentEnrollments(userId);

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las inscripciones',
    });
  }
};
