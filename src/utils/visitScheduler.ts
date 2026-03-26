export interface LabTrendPoint {
  visitId: string;
  value: number;
}

export interface LabTrendResult {
  trend: 'stable' | 'increasing' | 'decreasing';
  points: LabTrendPoint[];
}

export type LabsByVisit = Record<string, Record<string, number | null | undefined>>;

export interface Visit {
  id: string;
  name: string;
  date: string;
  day: number;
}

export interface ScheduleConfig {
  screeningWindow: number;
  treatmentWeeks: number;
  followUpWeeks: number;
  visitIntervalDays: number;
}

export interface ScheduledVisit {
  id?: string;
  name?: string;
  date?: string;
  day?: number;
  visitNumber?: number;
  visitName?: string;
  scheduledDate?: string;
  windowStart?: string;
  windowEnd?: string;
  phase?: 'screening' | 'treatment' | 'follow-up';
}

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export function generateVisitSchedule(startDate: string | Date | null, pattern: number[]): ScheduledVisit[] {
  if (!startDate) return [];
  const base = new Date(startDate);
  const visits: ScheduledVisit[] = [];
  pattern.forEach((offsetDays, index) => {
    const d = new Date(base.getTime());
    d.setDate(d.getDate() + offsetDays);
    visits.push({
      id: `visit-${index + 1}`,
      name: index === 0 ? 'Baseline' : `Visit ${index}`,
      date: d.toISOString().substring(0, 10),
      day: offsetDays
    });
  });
  return visits;
}

export function generateVisitsFromPattern(startDate: string | Date | null, pattern: number[]): Visit[] {
  if (!startDate) return [];
  const base = new Date(startDate);
  const visits: Visit[] = [];
  pattern.forEach((offsetDays, index) => {
    const d = new Date(base.getTime());
    d.setDate(d.getDate() + offsetDays);
    visits.push({
      id: `visit-${index + 1}`,
      name: index === 0 ? 'Baseline' : `Visit ${index}`,
      date: d.toISOString().substring(0, 10),
      day: offsetDays
    });
  });
  return visits;
}

export const generateScheduledVisitsFromConfig = (
  enrollmentDate: string,
  config: ScheduleConfig
): ScheduledVisit[] => {
  const schedule: ScheduledVisit[] = [];
  const baseDate = new Date(enrollmentDate);

  schedule.push({
    visitNumber: 0,
    visitName: 'Screening',
    scheduledDate: formatDate(addDays(baseDate, -config.screeningWindow)),
    windowStart: formatDate(addDays(baseDate, -config.screeningWindow - 3)),
    windowEnd: formatDate(addDays(baseDate, -1)),
    phase: 'screening',
  });

  schedule.push({
    visitNumber: 1,
    visitName: 'Baseline / Day 1',
    scheduledDate: formatDate(baseDate),
    windowStart: formatDate(baseDate),
    windowEnd: formatDate(baseDate),
    phase: 'treatment',
  });

  const treatmentVisits = Math.floor((config.treatmentWeeks * 7) / config.visitIntervalDays);
  for (let i = 1; i <= treatmentVisits; i++) {
    const visitDay = i * config.visitIntervalDays;
    const visitDate = addDays(baseDate, visitDay);
    schedule.push({
      visitNumber: i + 1,
      visitName: `Week ${Math.floor(visitDay / 7)}`,
      scheduledDate: formatDate(visitDate),
      windowStart: formatDate(addDays(visitDate, -3)),
      windowEnd: formatDate(addDays(visitDate, 3)),
      phase: 'treatment',
    });
  }

  const endOfTreatment = addDays(baseDate, config.treatmentWeeks * 7);
  schedule.push({
    visitNumber: treatmentVisits + 2,
    visitName: 'End of Treatment',
    scheduledDate: formatDate(endOfTreatment),
    windowStart: formatDate(addDays(endOfTreatment, -3)),
    windowEnd: formatDate(addDays(endOfTreatment, 3)),
    phase: 'treatment',
  });

  const followUpVisits = Math.floor(config.followUpWeeks / 4);
  for (let i = 1; i <= followUpVisits; i++) {
    const followUpDate = addDays(endOfTreatment, i * 28);
    schedule.push({
      visitNumber: treatmentVisits + 2 + i,
      visitName: `Follow-up ${i}`,
      scheduledDate: formatDate(followUpDate),
      windowStart: formatDate(addDays(followUpDate, -7)),
      windowEnd: formatDate(addDays(followUpDate, 7)),
      phase: 'follow-up',
    });
  }

  return schedule;
};

export const isWithinWindow = (visit: ScheduledVisit, actualDate: string): boolean => {
  const actual = new Date(actualDate);
  const start = new Date(visit.windowStart!);
  const end = new Date(visit.windowEnd!);
  return actual >= start && actual <= end;
};

export const getVisitStatus = (
  visit: ScheduledVisit,
  actualDate: string | undefined
): 'scheduled' | 'completed' | 'missed' | 'upcoming' => {
  const today = new Date();
  const scheduled = new Date(visit.scheduledDate!);
  const windowEnd = new Date(visit.windowEnd!);

  if (actualDate) {
    return 'completed';
  }

  if (today > windowEnd) {
    return 'missed';
  }

  if (today >= new Date(visit.windowStart!)) {
    return 'scheduled';
  }

  return 'upcoming';
};

export function evaluateLabTrends(labsByVisit: LabsByVisit, labName: string): LabTrendResult {
  const points: LabTrendPoint[] = [];
  Object.keys(labsByVisit).forEach((visitId) => {
    const v = labsByVisit[visitId]?.[labName];
    if (v != null) {
      points.push({ visitId, value: v });
    }
  });
  points.sort((a, b) => a.visitId.localeCompare(b.visitId));
  if (points.length < 2) return { trend: 'stable', points };
  const first = points[0].value;
  const last = points[points.length - 1].value;
  if (last > first * 1.2) return { trend: 'increasing', points };
  if (last < first * 0.8) return { trend: 'decreasing', points };
  return { trend: 'stable', points };
}