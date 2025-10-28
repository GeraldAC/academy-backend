import { Request, Response, NextFunction } from 'express';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto, CourseFilters } from './courses.types';

const coursesService = new CoursesService();

export class CoursesController {
  async getAvailableSubjects(req: Request, res: Response, next: NextFunction) {
    try {
      const subjects = await coursesService.getAvailableSubjects();
      res.status(200).json(subjects);
    } catch (error) {
      next(error);
    }
  }

  async getAvailableUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, isActive } = req.query as {
        role?: string;
        isActive?: boolean;
      };

      const users = await coursesService.getAvailableUsers({
        role,
        isActive,
      });

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------------------------------

  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateCourseDto = req.body;
      const course = await coursesService.createCourse(data);
      res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  }

  async getAllCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: CourseFilters = req.query;
      const courses = await coursesService.getAllCourses(filters);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  }

  async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const course = await coursesService.getCourseById(id);

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      res.json(course);
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateCourseDto = req.body;
      const course = await coursesService.updateCourse(id, data);
      res.json(course);
    } catch (error) {
      next(error);
    }
  }
}
