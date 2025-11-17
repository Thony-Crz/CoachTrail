import type { PolarApiService } from '../../domain/repositories/PolarApiService';
import type { PolarActivity } from '../../domain/entities/PolarActivity';
import { getPolarApiBaseUrl } from '../../config/env';

// Polar AccessLink API endpoints
const POLAR_API_BASE = getPolarApiBaseUrl();

export class PolarAccessLinkService implements PolarApiService {
  /**
   * This method is deprecated - use PolarOAuthService instead
   */
  async authenticate(clientId: string, clientSecret: string): Promise<{ accessToken: string; userId: string }> {
    throw new Error('Please use the "Connect with Polar" button to authenticate via OAuth2 flow.');
  }

  /**
   * Fetch activities from Polar API
   * This would typically use the /exercises endpoint
   */
  async fetchActivities(accessToken: string, userId: string): Promise<PolarActivity[]> {
    try {
      // Fetch exercises from Polar AccessLink API
      const response = await fetch(`${POLAR_API_BASE}/v3/users/${userId}/exercise-transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Polar API error: ${response.status} ${response.statusText}`);
      }

      const transactionData = await response.json();
      
      if (!transactionData['transaction-id']) {
        return []; // No new exercises
      }

      const transactionId = transactionData['transaction-id'];
      
      // Get the list of exercise URLs
      const listResponse = await fetch(
        `${POLAR_API_BASE}/v3/users/${userId}/exercise-transactions/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!listResponse.ok) {
        throw new Error(`Failed to fetch exercise list: ${listResponse.statusText}`);
      }

      const exerciseList = await listResponse.json();
      const exercises: PolarActivity[] = [];

      // Fetch each exercise's details
      for (const exerciseUrl of exerciseList.exercises || []) {
        const exerciseResponse = await fetch(exerciseUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (exerciseResponse.ok) {
          const exercise = await exerciseResponse.json();
          exercises.push(this.mapPolarExercise(exercise));
        }
      }

      // Commit the transaction
      await fetch(
        `${POLAR_API_BASE}/v3/users/${userId}/exercise-transactions/${transactionId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      return exercises;
    } catch (error) {
      console.error('Error fetching Polar activities:', error);
      throw error;
    }
  }

  private mapPolarExercise(exercise: any): PolarActivity {
    return {
      id: exercise.id || crypto.randomUUID(),
      date: exercise['start-time'] || new Date().toISOString(),
      sport: exercise.sport || 'RUNNING',
      distanceMeters: exercise.distance,
      ascentMeters: exercise.ascent,
      duration: exercise.duration,
    };
  }
}
