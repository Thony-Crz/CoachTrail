export interface PolarCredentials {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  userId?: string;
}

export function isValidCredentials(creds: PolarCredentials | null): boolean {
  return !!(creds && creds.clientId && creds.clientSecret);
}

export function hasAccessToken(creds: PolarCredentials | null): boolean {
  return !!(creds && creds.accessToken);
}
