import type { TrailRun } from '../entities/TrailRun';

export interface TrailRunRepository {
  getAll(): Promise<TrailRun[]>;
  save(run: TrailRun): Promise<void>;
  delete(id: string): Promise<void>;
}
