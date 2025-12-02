import { Request, Response, NextFunction } from 'express';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './enrollments.types';

const service = new EnrollmentsService();

export class EnrollmentsController {
  async enrollStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateEnrollmentDto = req.body;
      const result = await service.enrollStudent(data);
      res.status(201).json({
        message: 'Estudiante matriculado exitosamente',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEnrolledStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const students = await service.getEnrolledStudents(courseId);
      res.json(students);
    } catch (error) {
      next(error);
    }
  }

  // 🆕 NUEVO: Obtener estudiantes disponibles para matricular
  async getAvailableStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const students = await service.getAvailableStudents(courseId);
      res.json(students);
    } catch (error) {
      next(error);
    }
  }

  async deleteEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await service.deleteEnrollment(id);
      res.json({
        message: 'Matrícula cancelada exitosamente',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
