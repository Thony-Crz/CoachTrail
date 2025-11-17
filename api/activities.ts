import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Type definitions for Polar API responses
 */
interface TransactionResponse {
  'transaction-id'?: number;
}

interface ExerciseListResponse {
  exercises?: string[];
}

interface ExerciseResponse {
  id?: string;
  'start-time'?: string;
  sport?: string;
  distance?: number;
  ascent?: number;
  duration?: string;
}

/**
 * Vercel Serverless Function: Fetch Polar Activities
 * 
 * This endpoint fetches activities from the Polar AccessLink API
 * and returns them to the frontend.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accessToken, userId } = req.body;

    if (!accessToken || !userId) {
      return res.status(400).json({ 
        error: 'Missing required parameters: accessToken, userId' 
      });
    }

    // Create exercise transaction
    const transactionResponse = await fetch(
      `https://www.polaraccesslink.com/v3/users/${userId}/exercise-transactions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!transactionResponse.ok) {
      const errorText = await transactionResponse.text();
      console.error('Transaction creation failed:', transactionResponse.status, errorText);
      return res.status(transactionResponse.status).json({ 
        error: `Transaction creation failed: ${transactionResponse.status}`,
        details: errorText
      });
    }

    const transactionData = await transactionResponse.json() as TransactionResponse;
    
    if (!transactionData['transaction-id']) {
      // No new exercises
      return res.status(200).json({ activities: [] });
    }

    const transactionId = transactionData['transaction-id'];
    
    // Get the list of exercise URLs
    const listResponse = await fetch(
      `https://www.polaraccesslink.com/v3/users/${userId}/exercise-transactions/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.error('Exercise list fetch failed:', listResponse.status, errorText);
      return res.status(listResponse.status).json({ 
        error: `Exercise list fetch failed: ${listResponse.status}`,
        details: errorText
      });
    }

    const exerciseList = await listResponse.json() as ExerciseListResponse;
    const activities = [];

    // Fetch each exercise's details
    for (const exerciseUrl of exerciseList.exercises || []) {
      try {
        const exerciseResponse = await fetch(exerciseUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (exerciseResponse.ok) {
          const exercise = await exerciseResponse.json() as ExerciseResponse;
          activities.push({
            id: exercise.id || generateActivityId(),
            date: exercise['start-time'] || new Date().toISOString(),
            sport: exercise.sport || 'RUNNING',
            distanceMeters: exercise.distance,
            ascentMeters: exercise.ascent,
            duration: exercise.duration,
          });
        }
      } catch (error) {
        console.error('Error fetching exercise:', error);
        // Continue with next exercise
      }
    }

    // Commit the transaction
    await fetch(
      `https://www.polaraccesslink.com/v3/users/${userId}/exercise-transactions/${transactionId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    return res.status(200).json({ activities });
  } catch (error) {
    console.error('Activities fetch error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Generate a unique activity ID
 */
function generateActivityId(): string {
  return `activity-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
