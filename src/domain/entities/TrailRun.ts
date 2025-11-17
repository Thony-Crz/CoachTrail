export interface TrailRun {
  id: string;
  date: string; // ISO date string
  distanceKm: number;
  elevationGainM: number;
}

export function calculatePoints(run: TrailRun): number {
  // 1 km = 1 pt, 100 m D+ = 1 pt
  const distancePoints = run.distanceKm;
  const elevationPoints = run.elevationGainM / 100;
  return distancePoints + elevationPoints;
}

export function getWeekKey(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
