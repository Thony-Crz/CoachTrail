import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Polar User Registration
 * 
 * This endpoint registers a user with the Polar AccessLink API.
 * Must be called once after getting the access token.
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
    const { accessToken, memberId } = req.body;

    if (!accessToken) {
      return res.status(400).json({ 
        error: 'Missing required parameter: accessToken' 
      });
    }

    // Register user with Polar API
    const registerResponse = await fetch('https://www.polaraccesslink.com/v3/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'member-id': memberId || generateMemberId(),
      }),
    });

    // 409 Conflict means user is already registered - that's OK
    if (registerResponse.status === 409) {
      const data = await registerResponse.json();
      return res.status(200).json({ 
        userId: data['polar-user-id'],
        alreadyRegistered: true
      });
    }

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.error('User registration failed:', registerResponse.status, errorText);
      return res.status(registerResponse.status).json({ 
        error: `User registration failed: ${registerResponse.status}`,
        details: errorText
      });
    }

    const data = await registerResponse.json();
    return res.status(200).json({ 
      userId: data['polar-user-id'],
      alreadyRegistered: false
    });
  } catch (error) {
    console.error('User registration error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Generate a unique member ID
 */
function generateMemberId(): string {
  return `member-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
