import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JwtProvider, JwtPayload } from './jwt.provider';

describe('JwtProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test-secret-key',
      JWT_EXPIRES_IN: '1h',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should throw error when JWT_SECRET is not defined', () => {
      delete process.env.JWT_SECRET;

      expect(() => new JwtProvider()).toThrow(
        'JWT_SECRET environment variable is required',
      );
    });

    it('should throw error when JWT_EXPIRES_IN is not defined', () => {
      delete process.env.JWT_EXPIRES_IN;

      expect(() => new JwtProvider()).toThrow(
        'JWT_EXPIRES_IN environment variable is required',
      );
    });

    it('should create instance successfully with valid environment variables', () => {
      const jwtProvider = new JwtProvider();

      expect(jwtProvider).toBeInstanceOf(JwtProvider);
    });
  });

  describe('sign', () => {
    it('should generate a valid JWT token', () => {
      const jwtProvider = new JwtProvider();
      const payload: JwtPayload = {
        userId: '123',
        email: 'test@example.com',
      };

      const token = jwtProvider.sign(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate different tokens for different payloads', () => {
      const jwtProvider = new JwtProvider();
      const payload1: JwtPayload = {
        userId: '123',
        email: 'test1@example.com',
      };
      const payload2: JwtPayload = {
        userId: '456',
        email: 'test2@example.com',
      };

      const token1 = jwtProvider.sign(payload1);
      const token2 = jwtProvider.sign(payload2);

      expect(token1).not.toBe(token2);
    });
  });

  describe('verify', () => {
    it('should verify and decode a valid token', () => {
      const jwtProvider = new JwtProvider();
      const payload: JwtPayload = {
        userId: '123',
        email: 'test@example.com',
      };

      const token = jwtProvider.sign(payload);
      const decoded = jwtProvider.verify(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw error for invalid token', () => {
      const jwtProvider = new JwtProvider();
      const invalidToken = 'invalid.token.here';

      expect(() => jwtProvider.verify(invalidToken)).toThrow(
        'Invalid or expired token',
      );
    });

    it('should throw error for token signed with different secret', () => {
      const jwtProvider1 = new JwtProvider();
      const payload: JwtPayload = {
        userId: '123',
        email: 'test@example.com',
      };

      const token = jwtProvider1.sign(payload);

      process.env.JWT_SECRET = 'different-secret';
      const jwtProvider2 = new JwtProvider();

      expect(() => jwtProvider2.verify(token)).toThrow(
        'Invalid or expired token',
      );
    });

    it('should throw error for malformed token', () => {
      const jwtProvider = new JwtProvider();

      expect(() => jwtProvider.verify('malformed')).toThrow(
        'Invalid or expired token',
      );
    });
  });
});
