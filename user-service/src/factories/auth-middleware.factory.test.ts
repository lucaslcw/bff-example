import { describe, it, expect, beforeEach } from 'vitest';
import { createAuthMiddleware } from './auth-middleware.factory';
import { AuthMiddleware } from '../middlewares/auth.middleware';

describe('createAuthMiddleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test-secret-key',
      JWT_EXPIRES_IN: '1h',
    };
  });

  it('should create an AuthMiddleware instance', () => {
    const middleware = createAuthMiddleware();

    expect(middleware).toBeInstanceOf(AuthMiddleware);
  });

  it('should create middleware with authenticate method', () => {
    const middleware = createAuthMiddleware();

    expect(middleware.authenticate).toBeDefined();
    expect(typeof middleware.authenticate).toBe('function');
  });

  it('should create a new instance each time', () => {
    const middleware1 = createAuthMiddleware();
    const middleware2 = createAuthMiddleware();

    expect(middleware1).not.toBe(middleware2);
  });

  it('should create middleware that can be used as a function', () => {
    const middleware = createAuthMiddleware();

    expect(middleware.authenticate).toBeInstanceOf(Function);
  });

  it('should throw error when JWT_SECRET is not defined', () => {
    delete process.env.JWT_SECRET;

    expect(() => createAuthMiddleware()).toThrow(
      'JWT_SECRET environment variable is required',
    );
  });

  it('should throw error when JWT_EXPIRES_IN is not defined', () => {
    delete process.env.JWT_EXPIRES_IN;

    expect(() => createAuthMiddleware()).toThrow(
      'JWT_EXPIRES_IN environment variable is required',
    );
  });
});
