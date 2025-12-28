import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from './attendance.service';
import { RegisterAttendanceDto } from './attendance.types';

const service = new AttendanceService();

// Helper para obtener el usuario autenticado
const getAuthUser = (req: Request) => {
  return (req as any).user as
    | {
        id: string;
        email: string;
        role: 'STUDENT' | 'TEACHER' | 'ADMIN';
        firstName: string;
        lastName: string;
      }
    | undefined;
};

export class AttendanceController {
  // Registrar asistencia (Docente)
  async registerAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getAuthUser(req);

      if (!user) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const teacherId = user.id;
      const data: RegisterAttendanceDto = {
        ...req.body,
        recordedBy: teacherId,
      };

      const result = await service.registerBatch(data);
      res.status(201).json({
        message: 'Asistencia registrada exitosamente',
        count: result.length,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener asistencia por fecha (Docente)
  async getByDate(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, date } = req.params;
      const result = await service.getByCourseAndDate(courseId, date);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Estadísticas (Estudiante)
  async getMyStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getAuthUser(req);

      if (!user) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const studentId = user.id;
      const stats = await service.getStudentStats(studentId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // Historial (Estudiante)
  async getMyHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getAuthUser(req);

      if (!user) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const studentId = user.id;
      const history = await service.getStudentHistory(studentId);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }

  // Estadísticas generales (Admin/Teacher)
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as {
        courseId?: string;
        startDate?: string;
        endDate?: string;
      };
      const stats = await service.getStats(query);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // Reporte detallado (Admin/Teacher)
  async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as {
        courseId?: string;
        studentId?: string;
        startDate?: string;
        endDate?: string;
      };
      const report = await service.getReport(query);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
}
