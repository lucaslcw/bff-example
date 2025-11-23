import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthMiddleware } from './auth.middleware';
import { JwtProvider, JwtPayload } from '../provider/jwt.provider';
import type { FastifyRequest, FastifyReply } from 'fastify';

describe('AuthMiddleware', () => {
  let authMiddleware: AuthMiddleware;
  let mockJwtProvider: {
    verify: ReturnType<typeof vi.fn>;
    sign: ReturnType<typeof vi.fn>;
  };
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockJwtProvider = {
      verify: vi.fn(),
      sign: vi.fn(),
    };

    authMiddleware = new AuthMiddleware(
      mockJwtProvider as unknown as JwtProvider,
    );

    mockRequest = {
      headers: {},
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  describe('authenticate', () => {
    it('should return 401 when no authorization header is provided', async () => {
      await authMiddleware.authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    });

    it('should return 401 when authorization header is malformed', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat',
      };

      await authMiddleware.authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid token format',
      });
    });

    it('should return 401 when token is not Bearer type', async () => {
      mockRequest.headers = {
        authorization: 'Basic token123',
      };

      await authMiddleware.authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Token must be Bearer type',
      });
    });

    it('should return 401 when token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token',
      };

      mockJwtProvider.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authMiddleware.authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    });

    it('should set request.user and continue when token is valid', async () => {
      const validPayload: JwtPayload = {
        userId: '123',
        email: 'test@example.com',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid.token.here',
      };

      mockJwtProvider.verify.mockReturnValue(validPayload);

      await authMiddleware.authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockJwtProvider.verify).toHaveBeenCalledWith('valid.token.here');
      expect(mockRequest.user).toEqual(validPayload);
      expect(mockReply.status).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it('should handle Bearer with different casing', async () => {
      const validPayload: JwtPayload = {
        userId: '123',
        email: 'test@example.com',
      };

      mockRequest.headers = {
        authorization: 'bearer valid.token.here',
      };

      mockJwtProvider.verify.mockReturnValue(validPayload);

      await authMiddleware.authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockJwtProvider.verify).toHaveBeenCalledWith('valid.token.here');
      expect(mockRequest.user).toEqual(validPayload);
    });

    it('should return 500 when an unexpected error occurs', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid.token',
      };

      mockJwtProvider.verify.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await authMiddleware.authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    });
  });
});
