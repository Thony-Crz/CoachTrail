import type { TrailRunRepository } from '../../domain/repositories/TrailRunRepository';
import type { TrailRun } from '../../domain/entities/TrailRun';

const STORAGE_KEY = 'coach-trail-runs';

export class LocalStorageTrailRunRepository implements TrailRunRepository {
  async getAll(): Promise<TrailRun[]> {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data) as TrailRun[];
    } catch {
      return [];
    }
  }

  async save(run: TrailRun): Promise<void> {
    const runs = await this.getAll();
    const index = runs.findIndex((r) => r.id === run.id);
    if (index >= 0) {
      runs[index] = run;
    } else {
      runs.push(run);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  }

  async delete(id: string): Promise<void> {
    const runs = await this.getAll();
    const filtered = runs.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
}
