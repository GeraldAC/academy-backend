export interface RegisterAttendanceDto {
  courseId: string;
  classDate: string; // ISO Date string (YYYY-MM-DD)
  records: {
    studentId: string;
    present: boolean;
    notes?: string;
  }[];
  recordedBy: string; // Teacher ID
}

export interface AttendanceStatsDto {
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
  absences: number;
}

export interface AttendanceReportQueryDto {
  startDate?: string;
  endDate?: string;
  courseId?: string;
  studentId?: string;
}
