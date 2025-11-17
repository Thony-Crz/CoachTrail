import type { PolarCredentialsRepository } from '../../domain/repositories/PolarCredentialsRepository';
import type { PolarCredentials } from '../../domain/entities/PolarCredentials';

const STORAGE_KEY = 'coach-trail-polar-credentials';

export class LocalStoragePolarCredentialsRepository implements PolarCredentialsRepository {
  async get(): Promise<PolarCredentials | null> {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as PolarCredentials;
    } catch {
      return null;
    }
  }

  async save(credentials: PolarCredentials): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
}
