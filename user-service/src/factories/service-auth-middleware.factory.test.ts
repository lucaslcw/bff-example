import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServiceAuthMiddleware } from './service-auth-middleware.factory';
import { ServiceAuthMiddleware } from '../middlewares/service-auth.middleware';

describe('createServiceAuthMiddleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create ServiceAuthMiddleware instance', () => {
    process.env.SERVICE_TOKEN = 'test-service-token';

    const middleware = createServiceAuthMiddleware();

    expect(middleware).toBeInstanceOf(ServiceAuthMiddleware);
  });

  it('should throw error if SERVICE_TOKEN is not set', () => {
    delete process.env.SERVICE_TOKEN;

    expect(() => createServiceAuthMiddleware()).toThrow(
      'SERVICE_TOKEN environment variable is required',
    );
  });
});
