// src/controllers/schedules.controller.ts
import { Request, Response } from 'express';


import prisma from '../config/prisma'; // ✅ AGREGAR al inicio

// Obtener todos los horarios con filtros opcionales
// Obtener todos los horarios con filtros opcionales
export const getSchedules = async (req: Request, res: Response) => {
  try {
    const { courseId, dayOfWeek } = req.query;

    console.log('[DEBUG] getSchedules query params:', { courseId, dayOfWeek });

    const where: any = {};
    if (courseId) where.courseId = String(courseId);
    if (dayOfWeek) where.weekDay = dayOfWeek;

    console.log('[DEBUG] getSchedules where clause:', where);

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            subject: true,
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: [
        { weekDay: 'asc' },
        { startTime: 'asc' },
      ],
    });

    console.log(`[DEBUG] Found ${schedules.length} schedules`);

    // Transformar para incluir info del profesor en el nivel superior
    const transformedSchedules = schedules.map(schedule => ({
      ...schedule,
      teacher: schedule.course.teacher,
    }));

    res.json({
      data: transformedSchedules,
      total: transformedSchedules.length,
    });
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({ message: 'Error al obtener horarios' });
  }
};

// Obtener un horario por ID
export const getScheduleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            subject: true,
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }

    const transformed = {
      ...schedule,
      teacher: schedule.course.teacher,
    };

    res.json(transformed);
  } catch (error) {
    console.error('Error al obtener horario:', error);
    res.status(500).json({ message: 'Error al obtener horario' });
  }
};

// Crear nuevo horario
// Crear nuevo horario
// Crear nuevo horario
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const { courseId, dayOfWeek, startTime, endTime, classroom } = req.body;

    console.log('[DEBUG] createSchedule payload:', JSON.stringify(req.body, null, 2));

    // Validaciones
    if (!courseId || !dayOfWeek || !startTime || !endTime) {
      console.log('[DEBUG] Missing fields:', { courseId, dayOfWeek, startTime, endTime });
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar que el curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      console.log('[DEBUG] Course not found:', courseId);
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    // Verificar conflictos de horarios
    const conflict = await prisma.schedule.findFirst({
      where: {
        courseId,
        weekDay: dayOfWeek,
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(`1970-01-01T${startTime}`) } },
              { endTime: { gt: new Date(`1970-01-01T${startTime}`) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(`1970-01-01T${endTime}`) } },
              { endTime: { gte: new Date(`1970-01-01T${endTime}`) } },
            ],
          },
        ],
      },
    });

    if (conflict) {
      console.log('[DEBUG] Schedule conflict found:', conflict);
      return res.status(409).json({
        message: 'Conflicto de horarios: El curso ya tiene una clase en ese horario'
      });
    }

    // Crear horario
    const schedule = await prisma.schedule.create({
      data: {
        courseId,
        weekDay: dayOfWeek,
        startTime: new Date(`1970-01-01T${startTime}`),
        endTime: new Date(`1970-01-01T${endTime}`),
        classroom: classroom || null,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            subject: true,
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const transformed = {
      ...schedule,
      teacher: schedule.course.teacher,
    };

    res.status(201).json(transformed);
  } catch (error) {
    console.error('Error al crear horario:', error);
    res.status(500).json({ message: 'Error al crear horario: ' + (error instanceof Error ? error.message : String(error)) });
  }
};

// Actualizar horario
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { courseId, dayOfWeek, startTime, endTime, classroom } = req.body;

    // Verificar que el horario existe
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }

    const updateData: any = {};
    if (courseId) updateData.courseId = courseId;
    if (dayOfWeek) updateData.weekDay = dayOfWeek;
    if (startTime) updateData.startTime = new Date(`1970-01-01T${startTime}`);
    if (endTime) updateData.endTime = new Date(`1970-01-01T${endTime}`);
    if (classroom !== undefined) updateData.classroom = classroom || null;

    const schedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            subject: true,
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const transformed = {
      ...schedule,
      teacher: schedule.course.teacher,
    };

    res.json(transformed);
  } catch (error) {
    console.error('Error al actualizar horario:', error);
    res.status(500).json({ message: 'Error al actualizar horario' });
  }
};

// Eliminar horario
export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }

    await prisma.schedule.delete({
      where: { id },
    });

    res.json({ message: 'Horario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar horario:', error);
    res.status(500).json({ message: 'Error al eliminar horario' });
  }
};

// Activar/Desactivar horario
export const toggleScheduleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }

    const updated = await prisma.schedule.update({
      where: { id },
      data: { isActive: !schedule.isActive },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            subject: true,
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ message: 'Error al cambiar estado' });
  }
};