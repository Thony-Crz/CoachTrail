import type { PolarCredentialsRepository } from '../repositories/PolarCredentialsRepository';
import type { PolarCredentials } from '../entities/PolarCredentials';

export class SavePolarCredentialsUseCase {
  constructor(private repository: PolarCredentialsRepository) {}

  async execute(credentials: PolarCredentials): Promise<void> {
    await this.repository.save(credentials);
  }
}
