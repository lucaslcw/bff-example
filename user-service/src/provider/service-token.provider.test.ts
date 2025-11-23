import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServiceTokenProvider } from './service-token.provider';

describe('ServiceTokenProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should throw error if SERVICE_TOKEN is not set', () => {
      delete process.env.SERVICE_TOKEN;

      expect(() => new ServiceTokenProvider()).toThrow(
        'SERVICE_TOKEN environment variable is required',
      );
    });

    it('should create instance if SERVICE_TOKEN is set', () => {
      process.env.SERVICE_TOKEN = 'test-service-token';

      expect(() => new ServiceTokenProvider()).not.toThrow();
    });
  });

  describe('verify', () => {
    it('should return true for valid token', () => {
      process.env.SERVICE_TOKEN = 'test-service-token';
      const provider = new ServiceTokenProvider();

      const result = provider.verify('test-service-token');

      expect(result).toBe(true);
    });

    it('should return false for invalid token', () => {
      process.env.SERVICE_TOKEN = 'test-service-token';
      const provider = new ServiceTokenProvider();

      const result = provider.verify('invalid-token');

      expect(result).toBe(false);
    });

    it('should return false for empty token', () => {
      process.env.SERVICE_TOKEN = 'test-service-token';
      const provider = new ServiceTokenProvider();

      const result = provider.verify('');

      expect(result).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return the service token', () => {
      process.env.SERVICE_TOKEN = 'test-service-token';
      const provider = new ServiceTokenProvider();

      const token = provider.getToken();

      expect(token).toBe('test-service-token');
    });
  });
});
