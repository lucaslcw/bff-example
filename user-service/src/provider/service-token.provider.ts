export class ServiceTokenProvider {
  private readonly serviceToken: string;

  constructor() {
    if (!process.env.SERVICE_TOKEN) {
      throw new Error('SERVICE_TOKEN environment variable is required');
    }
    this.serviceToken = process.env.SERVICE_TOKEN;
  }

  verify(token: string): boolean {
    return token === this.serviceToken;
  }

  getToken(): string {
    return this.serviceToken;
  }
}
