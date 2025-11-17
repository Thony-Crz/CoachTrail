import type { TrailRunRepository } from '../repositories/TrailRunRepository';
import { getWeekKey } from '../entities/TrailRun';

export class DeleteWeekUseCase {
  constructor(private repository: TrailRunRepository) {}

  async execute(weekKey: string): Promise<void> {
    const runs = await this.repository.getAll();
    const runsToDelete = runs.filter((run) => getWeekKey(run.date) === weekKey);
    
    for (const run of runsToDelete) {
      await this.repository.delete(run.id);
    }
  }
}
