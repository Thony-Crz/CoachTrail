import type { PolarActivity } from '../entities/PolarActivity';

export interface PolarApiService {
  authenticate(clientId: string, clientSecret: string): Promise<{ accessToken: string; userId: string }>;
  fetchActivities(accessToken: string, userId: string): Promise<PolarActivity[]>;
}
