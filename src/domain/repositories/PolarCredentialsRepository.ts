import type { PolarCredentials } from '../entities/PolarCredentials';

export interface PolarCredentialsRepository {
  get(): Promise<PolarCredentials | null>;
  save(credentials: PolarCredentials): Promise<void>;
  clear(): Promise<void>;
}
