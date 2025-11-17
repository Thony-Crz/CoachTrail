/**
 * Service to handle Polar OAuth 2.0 authorization flow with PKCE
 */
export class PolarOAuthService {
  private readonly authorizationEndpoint = 'https://flow.polar.com/oauth2/authorization';
  private readonly tokenEndpoint = 'https://polarremote.com/v2/oauth2/token';
  private readonly registerEndpoint = 'https://www.polaraccesslink.com/v3/users';
  
  /**
   * Generate a random string for code verifier (PKCE)
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }
  
  /**
   * Generate code challenge from verifier (PKCE)
   */
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(hash));
  }
  
  /**
   * Base64 URL encode helper
   */
  private base64URLEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  
  /**
   * Generate and store state parameter for CSRF protection
   */
  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }
  
  /**
   * Build authorization URL and initiate OAuth flow
   */
  async initiateAuthorization(clientId: string, redirectUri: string): Promise<void> {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateState();
    
    // Store code verifier and state in sessionStorage for later use
    sessionStorage.setItem('polar_code_verifier', codeVerifier);
    sessionStorage.setItem('polar_oauth_state', state);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'accesslink.read_all',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state,
    });
    
    const authUrl = `${this.authorizationEndpoint}?${params.toString()}`;
    
    // Redirect to Polar authorization page
    window.location.href = authUrl;
  }
  
  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    code: string,
    state: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<{ accessToken: string; expiresIn: number; tokenType: string }> {
    // Verify state to prevent CSRF
    const savedState = sessionStorage.getItem('polar_oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }
    
    const codeVerifier = sessionStorage.getItem('polar_code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }
    
    // Exchange code for token
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });
    
    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
      },
      body: params.toString(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    // Clean up session storage
    sessionStorage.removeItem('polar_code_verifier');
    sessionStorage.removeItem('polar_oauth_state');
    
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };
  }
  
  /**
   * Register user with Polar AccessLink API to get user ID
   * This must be done once after getting the access token
   */
  async registerUser(accessToken: string): Promise<{ userId: string }> {
    const response = await fetch(this.registerEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'member-id': crypto.randomUUID(), // Generate a unique member ID
      }),
    });
    
    // 409 Conflict means user is already registered - that's OK
    if (response.status === 409) {
      // User already registered, get the user ID from the response
      const data = await response.json();
      return { userId: data['polar-user-id'] };
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`User registration failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return { userId: data['polar-user-id'] };
  }
  
  /**
   * Parse OAuth callback parameters from URL
   */
  parseCallbackParams(url: string): { code: string; state: string } | null {
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    const state = urlObj.searchParams.get('state');
    const error = urlObj.searchParams.get('error');
    
    if (error) {
      throw new Error(`OAuth error: ${error} - ${urlObj.searchParams.get('error_description')}`);
    }
    
    if (!code || !state) {
      return null;
    }
    
    return { code, state };
  }
}
