import type { PolarApiService } from '../repositories/PolarApiService';
import type { TrailRunRepository } from '../repositories/TrailRunRepository';
import type { PolarCredentialsRepository } from '../repositories/PolarCredentialsRepository';
import { isPolarActivityTrailRun, polarActivityToTrailRunData } from '../entities/PolarActivity';
import type { TrailRun } from '../entities/TrailRun';
import { hasAccessToken } from '../entities/PolarCredentials';

export interface SyncResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export class SyncPolarActivitiesUseCase {
  constructor(
    private polarApi: PolarApiService,
    private credentialsRepo: PolarCredentialsRepository,
    private trailRunRepo: TrailRunRepository
  ) {}

  async execute(): Promise<SyncResult> {
    const result: SyncResult = {
      imported: 0,
      skipped: 0,
      errors: [],
    };

    try {
      // Get credentials
      const credentials = await this.credentialsRepo.get();
      if (!credentials || !hasAccessToken(credentials)) {
        throw new Error('No valid Polar credentials found. Please configure your credentials first.');
      }

      // Fetch activities from Polar
      const activities = await this.polarApi.fetchActivities(
        credentials.accessToken!,
        credentials.userId!
      );

      // Get existing runs to avoid duplicates
      const existingRuns = await this.trailRunRepo.getAll();
      const existingDates = new Set(existingRuns.map(r => r.date));

      // Import trail running activities
      for (const activity of activities) {
        try {
          // Only import trail running activities
          if (!isPolarActivityTrailRun(activity)) {
            result.skipped++;
            continue;
          }

          // Convert to trail run format
          const runData = polarActivityToTrailRunData(activity);

          // Skip if already exists (same date)
          if (existingDates.has(runData.date)) {
            result.skipped++;
            continue;
          }

          // Save the run
          const newRun: TrailRun = {
            id: crypto.randomUUID(),
            ...runData,
          };

          await this.trailRunRepo.save(newRun);
          result.imported++;
        } catch (error) {
          result.errors.push(`Failed to import activity ${activity.id}: ${error}`);
        }
      }

      return result;
    } catch (error) {
      result.errors.push(`Sync failed: ${error}`);
      return result;
    }
  }
}
