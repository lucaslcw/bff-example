import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServiceAuthMiddleware } from './service-auth.middleware';
import { ServiceTokenProvider } from '../provider/service-token.provider';
import type { FastifyRequest, FastifyReply } from 'fastify';

describe('ServiceAuthMiddleware', () => {
  let serviceAuthMiddleware: ServiceAuthMiddleware;
  let mockServiceTokenProvider: {
    verify: ReturnType<typeof vi.fn>;
    getToken: ReturnType<typeof vi.fn>;
  };
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockServiceTokenProvider = {
      verify: vi.fn(),
      getToken: vi.fn(),
    };

    serviceAuthMiddleware = new ServiceAuthMiddleware(
      mockServiceTokenProvider as unknown as ServiceTokenProvider,
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
    it('should return 401 when no x-token header is provided', async () => {
      await serviceAuthMiddleware.authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'No service token provided',
      });
    });

    it('should return 401 when x-token is not a string', async () => {
      mockRequest.headers = {
        'x-token': ['invalid', 'array'],
      };

      await serviceAuthMiddleware.authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid token format',
      });
    });

    it('should return 401 when token is invalid', async () => {
      mockRequest.headers = {
        'x-token': 'invalid-token',
      };

      mockServiceTokenProvider.verify.mockReturnValue(false);

      await serviceAuthMiddleware.authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockServiceTokenProvider.verify).toHaveBeenCalledWith(
        'invalid-token',
      );
      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid service token',
      });
    });

    it('should continue when token is valid', async () => {
      mockRequest.headers = {
        'x-token': 'valid-service-token',
      };

      mockServiceTokenProvider.verify.mockReturnValue(true);

      await serviceAuthMiddleware.authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockServiceTokenProvider.verify).toHaveBeenCalledWith(
        'valid-service-token',
      );
      expect(mockReply.status).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it('should return 500 when an unexpected error occurs', async () => {
      mockRequest.headers = {
        'x-token': 'valid-token',
      };

      mockServiceTokenProvider.verify.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await serviceAuthMiddleware.authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Authentication failed',
      });
    });
  });
});
