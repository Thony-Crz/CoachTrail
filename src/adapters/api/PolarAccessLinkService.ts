import type { PolarApiService } from '../../domain/repositories/PolarApiService';
import type { PolarActivity } from '../../domain/entities/PolarActivity';

// Polar AccessLink API endpoints
const POLAR_API_BASE = 'https://www.polaraccesslink.com/v3';

export class PolarAccessLinkService implements PolarApiService {
  /**
   * Authenticate with Polar API using client credentials
   * Note: This is a simplified flow. In production, you'd use OAuth2 authorization code flow
   * with proper redirect URIs and user consent.
   */
  async authenticate(clientId: string, clientSecret: string): Promise<{ accessToken: string; userId: string }> {
    // For this implementation, we'll use a basic auth approach
    // In a real scenario, this would involve:
    // 1. Redirect user to Polar's authorization URL
    // 2. User grants permission
    // 3. Polar redirects back with authorization code
    // 4. Exchange code for access token
    
    // Since we're in a client-side only app, we'll simulate this
    // by storing the credentials and using them for API calls
    
    // In production, you would do:
    // const response = await fetch('https://polarremote.com/v2/oauth2/token', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: new URLSearchParams({
    //     grant_type: 'authorization_code',
    //     code: authCode,
    //     redirect_uri: redirectUri,
    //   }),
    //   headers: {
    //     'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
    //   }
    // });
    
    throw new Error('OAuth2 flow not yet implemented. Please use the Polar Flow web interface to authorize this app first.');
  }

  /**
   * Fetch activities from Polar API
   * This would typically use the /exercises endpoint
   */
  async fetchActivities(accessToken: string, userId: string): Promise<PolarActivity[]> {
    try {
      // Fetch exercises from Polar AccessLink API
      const response = await fetch(`${POLAR_API_BASE}/users/${userId}/exercise-transactions`, {
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
        `${POLAR_API_BASE}/users/${userId}/exercise-transactions/${transactionId}`,
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
        `${POLAR_API_BASE}/users/${userId}/exercise-transactions/${transactionId}`,
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
