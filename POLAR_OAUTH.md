# Polar OAuth Integration - Technical Documentation

## Overview

This document explains the OAuth 2.0 authorization code flow implementation for Polar AccessLink integration in CoachTrail.

## Architecture

### Components

1. **PolarOAuthService** (`src/domain/services/PolarOAuthService.ts`)
   - Domain service that handles OAuth 2.0 flow
   - Independent of UI framework
   - Implements PKCE (Proof Key for Code Exchange) for security

2. **PolarSettings Component** (`src/ui/components/PolarSettings.svelte`)
   - UI component that manages the OAuth flow
   - Handles user interactions (Connect, Disconnect, Sync)
   - Processes OAuth callbacks

3. **PolarAccessLinkService** (`src/adapters/api/PolarAccessLinkService.ts`)
   - API adapter for Polar AccessLink
   - Handles activity synchronization

## OAuth 2.0 Flow

### Step-by-Step Process

1. **User Saves Credentials**
   - User obtains Client ID and Client Secret from Polar AccessLink Admin
   - Credentials are saved to localStorage

2. **Authorization Initiation**
   - User clicks "Connect with Polar"
   - `PolarOAuthService.initiateAuthorization()` is called
   - Code verifier and challenge are generated (PKCE)
   - State parameter is generated (CSRF protection)
   - User is redirected to Polar authorization endpoint

3. **User Authorization**
   - User logs in to Polar Flow
   - User grants permission to the application
   - Polar redirects back to the app with authorization code and state

4. **Callback Processing**
   - App receives OAuth callback on page load
   - `PolarOAuthService.parseCallbackParams()` extracts code and state
   - State is validated to prevent CSRF attacks
   - `PolarOAuthService.exchangeCodeForToken()` exchanges code for access token

5. **User Registration**
   - `PolarOAuthService.registerUser()` registers the user with Polar API
   - Returns the Polar user ID
   - If user is already registered (409 Conflict), retrieves existing user ID

6. **Save Complete Credentials**
   - Access token and user ID are saved to localStorage
   - User is now connected and can sync activities

## Security Features

### PKCE (Proof Key for Code Exchange)

PKCE prevents authorization code interception attacks:

1. Generate random `code_verifier` (32 bytes)
2. Create `code_challenge` = BASE64URL(SHA256(code_verifier))
3. Send `code_challenge` with authorization request
4. Send `code_verifier` with token exchange request
5. Polar validates that SHA256(code_verifier) matches the original code_challenge

### State Parameter

Protects against CSRF attacks:

1. Generate random state parameter
2. Store in sessionStorage
3. Include in authorization URL
4. Validate that returned state matches stored value

### Storage Security

- **sessionStorage**: Temporary OAuth state (code_verifier, state)
  - Cleared after token exchange
  - Not shared across tabs
  - Cleared when tab is closed

- **localStorage**: Persistent credentials (clientId, clientSecret, accessToken, userId)
  - Persists across sessions
  - Only accessible by same origin
  - Never sent to third-party servers

## API Endpoints

### Polar OAuth Endpoints

1. **Authorization Endpoint**: `https://flow.polar.com/oauth2/authorization`
   - Parameters: client_id, redirect_uri, scope, code_challenge, state
   - Returns: authorization code

2. **Token Endpoint**: `https://polarremote.com/v2/oauth2/token`
   - Parameters: grant_type, code, redirect_uri, code_verifier
   - Authentication: Basic (Client ID + Secret)
   - Returns: access_token, expires_in

3. **User Registration**: `https://www.polaraccesslink.com/v3/users`
   - Method: POST
   - Authentication: Bearer (access token)
   - Returns: polar-user-id

## Configuration

### Redirect URI

The redirect URI must match exactly what's configured in Polar AccessLink Admin:

- Development: `http://localhost:5173/CoachTrail/`
- Production: `https://your-domain.com/CoachTrail/`

The app automatically determines the redirect URI using:
```typescript
function getRedirectUri(): string {
  const url = new URL(window.location.href);
  return `${url.origin}${url.pathname}`;
}
```

### Scope

The app requests the `accesslink.read_all` scope, which allows:
- Reading user's exercise data
- Reading user's physical information
- Reading user's training data

## Error Handling

### Common Errors

1. **"Invalid state parameter"**
   - Possible CSRF attack
   - State mismatch between request and callback
   - Solution: Try again

2. **"Code verifier not found"**
   - sessionStorage was cleared
   - User navigated away during OAuth flow
   - Solution: Restart the authorization flow

3. **"Token exchange failed: 401"**
   - Invalid client credentials
   - Solution: Verify Client ID and Secret

4. **"User registration failed: 403"**
   - Access token is invalid or expired
   - Solution: Reconnect to get a new access token

## Testing

### Manual Testing

1. Create test client in Polar AccessLink Admin
2. Set redirect URI to `http://localhost:5173/CoachTrail/`
3. Copy Client ID and Secret
4. Start dev server: `npm run dev`
5. Open app and save credentials
6. Click "Connect with Polar"
7. Log in to Polar and grant permission
8. Verify redirect back to app
9. Verify "Connected" status
10. Click "Sync Activities"

### Testing Without Real Polar Account

The OAuth flow requires a real Polar account. For testing:
- Use Polar's test/sandbox environment if available
- Use a personal Polar account for development
- Mock the OAuth endpoints for unit tests

## Future Improvements

1. **Token Refresh**
   - Implement automatic token refresh when expired
   - Store refresh_token if provided by Polar

2. **Error Recovery**
   - Better error messages for users
   - Automatic retry on transient errors

3. **Multiple Accounts**
   - Support connecting multiple Polar accounts
   - Switch between accounts

4. **Offline Support**
   - Queue sync requests when offline
   - Sync when connection is restored

## References

- [Polar AccessLink API Documentation](https://www.polar.com/accesslink-api/)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)
