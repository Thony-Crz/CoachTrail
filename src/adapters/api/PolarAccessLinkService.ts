import type { PolarApiService } from '../../domain/repositories/PolarApiService';
import type { PolarActivity } from '../../domain/entities/PolarActivity';
import { getBackendApiUrl } from '../../config/env';

// Polar API backend endpoint
const ACTIVITIES_ENDPOINT = getBackendApiUrl('/api/activities');

export class PolarAccessLinkService implements PolarApiService {
  /**
   * This method is deprecated - use PolarOAuthService instead
   */
  async authenticate(clientId: string, clientSecret: string): Promise<{ accessToken: string; userId: string }> {
    throw new Error('Please use the "Connect with Polar" button to authenticate via OAuth2 flow.');
  }

  /**
   * Fetch activities from Polar API via Vercel backend
   */
  async fetchActivities(accessToken: string, userId: string): Promise<PolarActivity[]> {
    try {
      // Fetch exercises via Vercel backend
      const response = await fetch(ACTIVITIES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Polar API error: ${response.status} ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      return data.activities || [];
    } catch (error) {
      console.error('Error fetching Polar activities:', error);
      throw error;
    }
  }
}
