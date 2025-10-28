import { PrismaClient, Role } from '@prisma/client';
import { faker } from '@faker-js/faker';

interface CourseTemplate {
  name: string;
  subject: string;
  description: string;
  capacity: number;
  monthlyPrice: number;
}

// Plantillas realistas de cursos preuniversitarios
const COURSE_TEMPLATES: CourseTemplate[] = [
  // Matemática
  {
    name: 'Matemática Básica',
    subject: 'Matemática',
    description:
      'Fundamentos de álgebra, aritmética y geometría básica para estudiantes que inician su preparación preuniversitaria.',
    capacity: 30,
    monthlyPrice: 200.0,
  },
  {
    name: 'Matemática Intermedia',
    subject: 'Matemática',
    description:
      'Profundización en álgebra, trigonometría y geometría analítica. Incluye resolución de problemas tipo examen de admisión.',
    capacity: 25,
    monthlyPrice: 250.0,
  },
  {
    name: 'Matemática Avanzada',
    subject: 'Matemática',
    description:
      'Nivel avanzado con cálculo diferencial e integral, geometría del espacio y problemas complejos de razonamiento matemático.',
    capacity: 20,
    monthlyPrice: 300.0,
  },

  // Física
  {
    name: 'Física I',
    subject: 'Física',
    description:
      'Cinemática, dinámica y estática. Fundamentos de mecánica clásica con enfoque en problemas de admisión universitaria.',
    capacity: 25,
    monthlyPrice: 220.0,
  },
  {
    name: 'Física II',
    subject: 'Física',
    description:
      'Termodinámica, electromagnetismo y óptica. Preparación intensiva para exámenes de ciencias e ingenierías.',
    capacity: 25,
    monthlyPrice: 240.0,
  },

  // Química
  {
    name: 'Química General',
    subject: 'Química',
    description:
      'Química inorgánica, orgánica y reacciones químicas. Teoría atómica, estequiometría y tabla periódica.',
    capacity: 28,
    monthlyPrice: 210.0,
  },
  {
    name: 'Química Orgánica',
    subject: 'Química',
    description:
      'Compuestos del carbono, nomenclatura, reacciones orgánicas y aplicaciones. Preparación para carreras de ciencias de la salud.',
    capacity: 22,
    monthlyPrice: 230.0,
  },

  // Biología
  {
    name: 'Biología Integral',
    subject: 'Biología',
    description:
      'Citología, genética, evolución y ecología. Curso completo para aspirantes a carreras de ciencias biológicas y salud.',
    capacity: 30,
    monthlyPrice: 200.0,
  },
  {
    name: 'Anatomía y Fisiología',
    subject: 'Biología',
    description:
      'Sistemas del cuerpo humano con énfasis en preparación para medicina y enfermería.',
    capacity: 25,
    monthlyPrice: 250.0,
  },

  // Lenguaje
  {
    name: 'Comunicación Integral',
    subject: 'Lenguaje',
    description:
      'Comprensión lectora, gramática española y redacción. Preparación para el área de comunicación en exámenes de admisión.',
    capacity: 35,
    monthlyPrice: 180.0,
  },
  {
    name: 'Literatura y Redacción',
    subject: 'Lenguaje',
    description:
      'Literatura peruana y universal, análisis de textos y producción de ensayos académicos.',
    capacity: 30,
    monthlyPrice: 190.0,
  },

  // Razonamiento
  {
    name: 'Razonamiento Verbal',
    subject: 'Razonamiento',
    description:
      'Analogías, antónimos, sinónimos, oraciones incompletas y comprensión de textos complejos.',
    capacity: 35,
    monthlyPrice: 170.0,
  },
  {
    name: 'Razonamiento Matemático',
    subject: 'Razonamiento',
    description:
      'Problemas de lógica, series numéricas, operadores matemáticos y razonamiento abstracto.',
    capacity: 30,
    monthlyPrice: 180.0,
  },

  // Historia y Geografía
  {
    name: 'Historia del Perú',
    subject: 'Historia',
    description:
      'Historia peruana desde las culturas preincas hasta la época contemporánea. Enfoque en cronología y personajes clave.',
    capacity: 32,
    monthlyPrice: 160.0,
  },
  {
    name: 'Geografía del Perú',
    subject: 'Geografía',
    description:
      'Geografía física y humana del Perú. Regiones naturales, recursos y aspectos socioeconómicos.',
    capacity: 30,
    monthlyPrice: 150.0,
  },
];

/**
 * seedCourses:
 * - Crea cursos realistas de un centro preuniversitario
 * - Asigna teachers existentes de manera aleatoria pero equilibrada
 * - Algunos cursos estarán inactivos para probar filtros
 * - Usa upsert para idempotencia basado en nombre + materia
 */
export async function seedCourses(prisma: PrismaClient, options?: { coursesCount?: number }) {
  console.log('Seeding courses...');

  // Obtener todos los teachers activos
  const teachers = await prisma.user.findMany({
    where: {
      role: Role.TEACHER,
      isActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  if (teachers.length === 0) {
    console.warn('No active teachers found. Please run user seeds first.');
    return;
  }

  console.log(`Found ${teachers.length} active teachers`);

  const coursesCount = options?.coursesCount ?? COURSE_TEMPLATES.length;
  const templatesToUse = COURSE_TEMPLATES.slice(0, coursesCount);

  // Distribuir teachers de manera equilibrada
  let teacherIndex = 0;

  for (const template of templatesToUse) {
    const teacher = teachers[teacherIndex % teachers.length];
    teacherIndex++;

    // 10% de probabilidad de que el curso esté inactivo (para testing)
    const isActive = Math.random() > 0.1;

    // Pequeña variación en capacidad y precio (±10%)
    const capacityVariation = faker.number.int({ min: -3, max: 3 });
    const priceVariation = faker.number.float({ min: -20, max: 20 });

    const course = await findOrCreateCourse(prisma, {
      name: template.name,
      description: template.description,
      subject: template.subject,
      teacherId: teacher.id,
      capacity: Math.max(15, Math.min(40, template.capacity + capacityVariation)),
      monthlyPrice: Math.max(100, template.monthlyPrice + priceVariation),
      isActive,
    });

    const status = isActive ? '✓' : '✗';
    console.log(
      `  ${status} ${course.name} (${course.subject}) - Teacher: ${teacher.firstName} ${teacher.lastName} - S/ ${course.monthlyPrice}`
    );
  }

  console.log(`Courses seed finished. Created/updated ${templatesToUse.length} courses.`);
}

/**
 * Helper para buscar o crear curso de manera idempotente
 * (alternativa más robusta al upsert simple)
 */
async function findOrCreateCourse(
  prisma: PrismaClient,
  data: {
    name: string;
    subject: string;
    description: string;
    teacherId: string;
    capacity: number;
    monthlyPrice: number;
    isActive: boolean;
  }
) {
  // Buscar curso existente por nombre y materia
  let course = await prisma.course.findFirst({
    where: {
      name: data.name,
      subject: data.subject,
    },
  });

  if (course) {
    // Actualizar si existe
    course = await prisma.course.update({
      where: { id: course.id },
      data: {
        description: data.description,
        teacherId: data.teacherId,
        capacity: data.capacity,
        monthlyPrice: data.monthlyPrice,
        isActive: data.isActive,
      },
    });
  } else {
    // Crear si no existe
    course = await prisma.course.create({
      data,
    });
  }

  return course;
}
