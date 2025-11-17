import type { TrailRunRepository } from '../repositories/TrailRunRepository';
import type { TrailRun } from '../entities/TrailRun';

export class AddTrailRunUseCase {
  constructor(private repository: TrailRunRepository) {}

  async execute(run: Omit<TrailRun, 'id'>): Promise<void> {
    const newRun: TrailRun = {
      ...run,
      id: crypto.randomUUID(),
    };
    await this.repository.save(newRun);
  }
}
