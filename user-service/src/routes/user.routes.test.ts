import { describe, it, expect, beforeEach, vi } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { userRoutes } from './user.routes';
import { UserController } from '../controllers/user.controller';

describe('userRoutes', () => {
  let fastify: FastifyInstance;
  let mockUserController: Partial<UserController>;

  beforeEach(async () => {
    fastify = Fastify();
    mockUserController = {
      createUser: vi.fn(),
    };
  });

  describe('POST /users', () => {
    it('should register POST /users route', async () => {
      await userRoutes(fastify, {
        userController: mockUserController as UserController,
      });

      const routes = fastify.printRoutes({ commonPrefix: false });
      expect(routes).toContain('/');
      expect(routes).toContain('POST');
    });

    it('should call userController.createUser when POST /users is called', async () => {
      const mockReply = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      (
        mockUserController.createUser as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockReply);

      await userRoutes(fastify, {
        userController: mockUserController as UserController,
      });

      const response = await fastify.inject({
        method: 'POST',
        url: '/',
        payload: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      expect(mockUserController.createUser).toHaveBeenCalled();
      expect(mockUserController.createUser).toHaveBeenCalledTimes(1);
    });

    it('should pass request and reply to controller', async () => {
      await userRoutes(fastify, {
        userController: mockUserController as UserController,
      });

      await fastify.inject({
        method: 'POST',
        url: '/',
        payload: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      const createUserCall = (
        mockUserController.createUser as ReturnType<typeof vi.fn>
      ).mock.calls[0];

      expect(createUserCall).toBeDefined();
      expect(createUserCall[0]).toHaveProperty('body');
      expect(createUserCall[1]).toHaveProperty('status');
    });

    it('should handle different request payloads', async () => {
      await userRoutes(fastify, {
        userController: mockUserController as UserController,
      });

      const payload1 = {
        email: 'user1@example.com',
        password: 'pass1',
      };

      const payload2 = {
        email: 'user2@example.com',
        password: 'pass2',
      };

      await fastify.inject({
        method: 'POST',
        url: '/',
        payload: payload1,
      });

      await fastify.inject({
        method: 'POST',
        url: '/',
        payload: payload2,
      });

      expect(mockUserController.createUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('route registration', () => {
    it('should be an async function', () => {
      expect(userRoutes).toBeInstanceOf(Function);
      expect(userRoutes.constructor.name).toBe('AsyncFunction');
    });

    it('should accept fastify instance and controller', async () => {
      await expect(
        userRoutes(fastify, {
          userController: mockUserController as UserController,
        }),
      ).resolves.not.toThrow();
    });

    it('should not throw when registering routes', async () => {
      await expect(
        userRoutes(fastify, {
          userController: mockUserController as UserController,
        }),
      ).resolves.toBeUndefined();
    });
  });
});
