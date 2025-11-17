import type { TrailRunRepository } from '../repositories/TrailRunRepository';
import { calculatePoints, getWeekKey } from '../entities/TrailRun';

export interface WeeklyStats {
  week: string;
  totalPoints: number;
  runCount: number;
}

export class GetWeeklyStatsUseCase {
  constructor(private repository: TrailRunRepository) {}

  async execute(): Promise<WeeklyStats[]> {
    const runs = await this.repository.getAll();
    const weeklyMap = new Map<string, { points: number; count: number }>();

    runs.forEach((run) => {
      const week = getWeekKey(run.date);
      const points = calculatePoints(run);
      const current = weeklyMap.get(week) || { points: 0, count: 0 };
      weeklyMap.set(week, {
        points: current.points + points,
        count: current.count + 1,
      });
    });

    return Array.from(weeklyMap.entries())
      .map(([week, data]) => ({
        week,
        totalPoints: Math.round(data.points * 10) / 10, // Round to 1 decimal
        runCount: data.count,
      }))
      .sort((a, b) => b.week.localeCompare(a.week)); // Most recent first
  }
}
