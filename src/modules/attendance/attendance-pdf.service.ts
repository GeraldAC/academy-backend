// src/modules/attendance/attendance-pdf.service.ts
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as fs from 'fs';
import * as path from 'path';

interface AttendanceRecord {
  id: string;
  classDate: Date;
  present: boolean;
  notes: string | null;
  course?: {
    name: string;
    subject: string;
  };
  student?: {
    firstName: string;
    lastName: string;
    dni: string;
    email: string;
  };
}

interface AttendanceStats {
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  attendanceRate: number;
}

interface PDFGenerationData {
  student?: {
    firstName: string;
    lastName: string;
    dni: string;
    email: string;
  };
  students?: Array<{
    firstName: string;
    lastName: string;
    dni: string;
    stats: AttendanceStats;
  }>;
  attendances: AttendanceRecord[];
  stats: AttendanceStats;
  filters?: {
    courseName?: string;
    startDate?: string;
    endDate?: string;
  };
  generatedBy: {
    name: string;
    role: string;
  };
}

export class AttendancePDFService {
  private logoPath: string;

  constructor() {
    // Ajusta la ruta según dónde tengas el logo
    this.logoPath = path.join(__dirname, '../../../public/logo.png');
    // Si el logo no existe, intentar una ruta alternativa
    if (!fs.existsSync(this.logoPath)) {
      this.logoPath = path.join(__dirname, '../../../assets/logo.png');
    }
  }

  /**
   * Genera un PDF de reporte de asistencia
   */
  async generateAttendancePDF(data: PDFGenerationData, res: Response): Promise<void> {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: 'Reporte de Asistencia',
        Author: 'Sistema de Academia',
        Subject: 'Reporte de Asistencia Estudiantil',
      },
    });

    // Configurar respuesta HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reporte-asistencia-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    );

    // Pipe del documento al response
    doc.pipe(res);

    // Generar contenido del PDF
    this.addHeader(doc);
    this.addStudentInfo(doc, data);
    this.addStats(doc, data.stats);
    this.addAttendanceTable(doc, data.attendances);
    this.addFooter(doc, data.generatedBy);

    // Finalizar documento
    doc.end();
  }

  /**
   * Genera PDF para múltiples estudiantes (reporte general)
   */
  async generateMultiStudentPDF(data: PDFGenerationData, res: Response): Promise<void> {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: 'Reporte General de Asistencia',
        Author: 'Sistema de Academia',
      },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reporte-general-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    );

    doc.pipe(res);

    this.addHeader(doc);
    this.addFiltersInfo(doc, data.filters);
    this.addStats(doc, data.stats);

    if (data.students && data.students.length > 0) {
      this.addStudentsSummary(doc, data.students);
    }

    this.addAttendanceTable(doc, data.attendances);
    this.addFooter(doc, data.generatedBy);

    doc.end();
  }

  /**
   * Agregar encabezado con logo
   */
  private addHeader(doc: PDFKit.PDFDocument): void {
    // Agregar logo si existe
    if (fs.existsSync(this.logoPath)) {
      try {
        doc.image(this.logoPath, 50, 45, { width: 80 });
      } catch (error) {
        console.warn('No se pudo cargar el logo:', error);
      }
    }

    // Título
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('EL GRAN ANDINO', 140, 50, { align: 'left' })
      .fontSize(12)
      .font('Helvetica')
      .text('Academia Preuniversitaria', 140, 75)
      .text('Reporte de Asistencia', 140, 90);

    // Fecha de generación
    doc
      .fontSize(10)
      .text(
        `Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`,
        400,
        50,
        { align: 'right' }
      );

    // Línea separadora
    doc.moveTo(50, 130).lineTo(545, 130).stroke();

    // Mover cursor
    doc.moveDown(2);
  }

  /**
   * Agregar información del estudiante
   */
  private addStudentInfo(doc: PDFKit.PDFDocument, data: PDFGenerationData): void {
    if (!data.student) return;

    const y = doc.y + 20;

    doc.fontSize(14).font('Helvetica-Bold').text('Datos del Estudiante', 50, y);

    doc
      .fontSize(11)
      .font('Helvetica')
      .text(`Nombre: ${data.student.firstName} ${data.student.lastName}`, 50, y + 25)
      .text(`DNI: ${data.student.dni}`, 50, y + 45)
      .text(`Email: ${data.student.email}`, 50, y + 65);

    if (data.filters?.courseName) {
      doc.text(`Curso: ${data.filters.courseName}`, 50, y + 85);
    }

    doc.moveDown(2);
  }

  /**
   * Agregar información de filtros
   */
  private addFiltersInfo(doc: PDFKit.PDFDocument, filters?: PDFGenerationData['filters']): void {
    if (!filters) return;

    const y = doc.y + 20;

    doc.fontSize(14).font('Helvetica-Bold').text('Filtros Aplicados', 50, y);

    let currentY = y + 25;

    if (filters.courseName) {
      doc.fontSize(11).font('Helvetica').text(`Curso: ${filters.courseName}`, 50, currentY);
      currentY += 20;
    }

    if (filters.startDate) {
      doc.text(`Fecha inicio: ${filters.startDate}`, 50, currentY);
      currentY += 20;
    }

    if (filters.endDate) {
      doc.text(`Fecha fin: ${filters.endDate}`, 50, currentY);
      currentY += 20;
    }

    doc.moveDown(1);
  }

  /**
   * Agregar estadísticas
   */
  private addStats(doc: PDFKit.PDFDocument, stats: AttendanceStats): void {
    const y = doc.y + 20;

    doc.fontSize(14).font('Helvetica-Bold').text('Estadísticas de Asistencia', 50, y);

    // Cuadro de estadísticas con colores
    const boxY = y + 30;
    const boxWidth = 120;
    const boxHeight = 80;
    const spacing = 10;

    // Total de clases
    doc
      .rect(50, boxY, boxWidth, boxHeight)
      .fillAndStroke('#EFF6FF', '#3B82F6')
      .fontSize(10)
      .fillColor('#1E40AF')
      .text('Total de Clases', 60, boxY + 15, { width: boxWidth - 20 })
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(stats.totalClasses.toString(), 60, boxY + 35, { width: boxWidth - 20 });

    // Presentes
    doc
      .rect(50 + boxWidth + spacing, boxY, boxWidth, boxHeight)
      .fillAndStroke('#F0FDF4', '#22C55E')
      .fontSize(10)
      .fillColor('#15803D')
      .text('Presentes', 60 + boxWidth + spacing, boxY + 15, { width: boxWidth - 20 })
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(stats.presentClasses.toString(), 60 + boxWidth + spacing, boxY + 35, {
        width: boxWidth - 20,
      });

    // Ausentes
    doc
      .rect(50 + (boxWidth + spacing) * 2, boxY, boxWidth, boxHeight)
      .fillAndStroke('#FEF2F2', '#EF4444')
      .fontSize(10)
      .fillColor('#B91C1C')
      .text('Ausentes', 60 + (boxWidth + spacing) * 2, boxY + 15, { width: boxWidth - 20 })
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(stats.absentClasses.toString(), 60 + (boxWidth + spacing) * 2, boxY + 35, {
        width: boxWidth - 20,
      });

    // Porcentaje
    doc
      .rect(50 + (boxWidth + spacing) * 3, boxY, boxWidth, boxHeight)
      .fillAndStroke('#F5F3FF', '#8B5CF6')
      .fontSize(10)
      .fillColor('#6D28D9')
      .text('% Asistencia', 60 + (boxWidth + spacing) * 3, boxY + 15, { width: boxWidth - 20 })
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(`${stats.attendanceRate.toFixed(1)}%`, 60 + (boxWidth + spacing) * 3, boxY + 35, {
        width: boxWidth - 20,
      });

    // Resetear color
    doc.fillColor('#000000');

    doc.y = boxY + boxHeight + 30;
  }

  /**
   * Agregar resumen de múltiples estudiantes
   */
  private addStudentsSummary(
    doc: PDFKit.PDFDocument,
    students: Array<{ firstName: string; lastName: string; dni: string; stats: AttendanceStats }>
  ): void {
    const y = doc.y + 20;

    doc.fontSize(14).font('Helvetica-Bold').text('Resumen por Estudiante', 50, y);

    // Verificar si necesitamos nueva página
    if (doc.y + students.length * 25 > 700) {
      doc.addPage();
    }

    // Tabla simple
    let currentY = doc.y + 20;

    students.forEach((student, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      const bgColor = index % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
      doc.rect(50, currentY, 495, 20).fill(bgColor);

      doc
        .fontSize(10)
        .fillColor('#000000')
        .text(`${student.firstName} ${student.lastName}`, 60, currentY + 5)
        .text(student.dni, 250, currentY + 5)
        .text(`${student.stats.attendanceRate.toFixed(1)}%`, 400, currentY + 5);

      currentY += 20;
    });

    doc.y = currentY + 20;
  }

  /**
   * Agregar tabla de asistencia
   */
  private addAttendanceTable(doc: PDFKit.PDFDocument, attendances: AttendanceRecord[]): void {
    if (attendances.length === 0) {
      doc
        .fontSize(11)
        .font('Helvetica')
        .text('No hay registros de asistencia para mostrar.', 50, doc.y + 20);
      return;
    }

    // Verificar si necesitamos nueva página
    if (doc.y > 600) {
      doc.addPage();
    }

    const y = doc.y + 20;

    doc.fontSize(14).font('Helvetica-Bold').text('Historial Detallado de Asistencia', 50, y);

    // Headers de la tabla
    const tableTop = y + 30;
    const rowHeight = 25;

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151');

    // Encabezados
    doc.text('Fecha', 50, tableTop);
    doc.text('Curso', 130, tableTop);
    doc.text('Estudiante', 260, tableTop);
    doc.text('Estado', 400, tableTop);
    doc.text('Notas', 470, tableTop);

    // Línea debajo de encabezados
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(545, tableTop + 15)
      .stroke();

    // Datos
    let currentY = tableTop + 20;

    attendances.forEach((record, index) => {
      // Nueva página si es necesario
      if (currentY > 720) {
        doc.addPage();
        currentY = 50;

        // Repetir encabezados
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#374151')
          .text('Fecha', 50, currentY)
          .text('Curso', 130, currentY)
          .text('Estudiante', 260, currentY)
          .text('Estado', 400, currentY)
          .text('Notas', 470, currentY);

        doc
          .moveTo(50, currentY + 15)
          .lineTo(545, currentY + 15)
          .stroke();

        currentY += 20;
      }

      // Fondo alternado
      if (index % 2 === 0) {
        doc.rect(50, currentY, 495, rowHeight).fill('#F9FAFB');
      }

      doc.fontSize(9).font('Helvetica').fillColor('#000000');

      // Fecha
      doc.text(format(new Date(record.classDate), 'dd/MM/yyyy', { locale: es }), 50, currentY + 8, {
        width: 70,
      });

      // Curso
      doc.text(record.course?.name || '-', 130, currentY + 8, { width: 120 });

      // Estudiante
      if (record.student) {
        doc.text(`${record.student.firstName} ${record.student.lastName}`, 260, currentY + 8, {
          width: 130,
        });
      }

      // Estado
      const status = record.present
        ? 'Presente'
        : record.notes?.toUpperCase().includes('PERMISO')
          ? 'Permiso'
          : 'Ausente';
      const statusColor = record.present
        ? '#22C55E'
        : record.notes?.toUpperCase().includes('PERMISO')
          ? '#F59E0B'
          : '#EF4444';

      doc.fillColor(statusColor).text(status, 400, currentY + 8, { width: 60 });
      doc.fillColor('#000000');

      // Notas
      doc.text(record.notes || '-', 470, currentY + 8, { width: 70 });

      currentY += rowHeight;
    });

    doc.y = currentY + 20;
  }

  /**
   * Agregar pie de página
   */
  private addFooter(doc: PDFKit.PDFDocument, generatedBy: { name: string; role: string }): void {
    const pageCount = doc.bufferedPageRange().count;

    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);

      // Línea superior del footer
      doc.moveTo(50, 770).lineTo(545, 770).stroke();

      // Información del generador
      doc
        .fontSize(8)
        .fillColor('#6B7280')
        .text(`Generado por: ${generatedBy.name} (${generatedBy.role})`, 50, 780, {
          align: 'left',
        });

      // Número de página
      doc.text(`Página ${i + 1} de ${pageCount}`, 50, 780, { align: 'right' });
    }
  }
}
