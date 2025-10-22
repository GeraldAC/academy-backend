// src/modules/dashboard/teacher/teacher-dashboard.controller.ts
import { Request, Response } from 'express';
import { TeacherDashboardService } from './teacher-dashboard.service';

const service = new TeacherDashboardService();

export class TeacherDashboardController {
  
  async getDashboard(req: Request, res: Response) {
    try {
      const teacherId = req.params.id;

      const [stats, courses, engagement, submissions, classes, messages] = await Promise.all([
        service.getTeacherStats(teacherId),
        service.getMyCourses(teacherId),
        service.getStudentEngagement(teacherId),
        service.getRecentSubmissions(teacherId),
        service.getUpcomingClasses(teacherId),
        service.getMessages(teacherId)
      ]);

      res.json({
        stats,
        courses,
        engagement,
        submissions,
        classes,
        messages
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Error fetching teacher dashboard',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}