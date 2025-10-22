// src/modules/dashboard/student/student-dashboard.controller.ts
import { Request, Response } from 'express';
import { StudentDashboardService } from './student-dashboard.service';

const service = new StudentDashboardService();

export class StudentDashboardController {
  
  async getDashboard(req: Request, res: Response) {
    try {
      const studentId = req.params.id;

      const [stats, enrolledCourses, progressData, assignments, grades, achievements, activity] = await Promise.all([
        service.getStudentStats(studentId),
        service.getEnrolledCourses(studentId),
        service.getProgressData(studentId),
        service.getUpcomingAssignments(studentId),
        service.getGradesData(studentId),
        service.getAchievements(studentId),
        service.getRecentActivity(studentId)
      ]);

      res.json({
        stats,
        enrolledCourses,
        progressData,
        assignments,
        grades,
        achievements,
        activity
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Error fetching student dashboard',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}