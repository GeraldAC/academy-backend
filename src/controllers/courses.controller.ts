// backend/src/controllers/courses.controller.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getCourses = async (req: Request, res: Response) => {
  try {
    console.log('📚 Petición recibida para obtener cursos');
    
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    console.log(`✅ Cursos encontrados: ${courses.length}`);
    console.log('Cursos:', JSON.stringify(courses, null, 2));

    res.json(courses);
  } catch (error) {
    console.error('❌ Error al obtener cursos:', error);
    res.status(500).json({ message: 'Error al obtener cursos', error: String(error) });
  }
};