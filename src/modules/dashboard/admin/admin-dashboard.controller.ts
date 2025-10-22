// src/modules/dashboard/admin/admin-dashboard.controller.ts
import { Request, Response } from 'express';
import { AdminDashboardService } from './admin-dashboard.service';

const service = new AdminDashboardService();

export class AdminDashboardController {
  
  async getDashboard(req: Request, res: Response) {
    try {
      const [stats, enrollmentTrend, coursesDistribution, topCourses, recentActivities, revenueData] = await Promise.all([
        service.getStats(),
        service.getEnrollmentTrend(),
        service.getCoursesDistribution(),
        service.getTopCourses(),
        service.getRecentActivities(),
        service.getRevenueData()
      ]);

      res.json({
        stats,
        enrollmentTrend,
        coursesDistribution,
        topCourses,
        recentActivities,
        revenueData
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Error fetching admin dashboard',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}