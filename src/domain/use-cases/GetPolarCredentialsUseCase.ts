import type { PolarCredentialsRepository } from '../repositories/PolarCredentialsRepository';
import type { PolarCredentials } from '../entities/PolarCredentials';

export class GetPolarCredentialsUseCase {
  constructor(private repository: PolarCredentialsRepository) {}

  async execute(): Promise<PolarCredentials | null> {
    return await this.repository.get();
  }
}
