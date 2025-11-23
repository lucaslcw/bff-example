import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '../errors/app-error';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserInputZod, AuthenticateUserInputZod } from '../dto/user.dto';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: Partial<UserService>;
  let mockRequest: Partial<FastifyRequest<{ Body: CreateUserInputZod }>>;
  let mockReply: Partial<FastifyReply>;
  let statusMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;
  let logErrorMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    logErrorMock = vi.fn();
    sendMock = vi.fn().mockReturnThis();
    statusMock = vi.fn().mockReturnValue({ send: sendMock });

    mockUserService = {
      createUser: vi.fn(),
      authenticateUser: vi.fn(),
    };

    mockRequest = {
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
      log: {
        error: logErrorMock,
      } as any,
    };

    mockReply = {
      status: statusMock,
    } as any;

    controller = new UserController(mockUserService as UserService);
  });

  describe('createUser', () => {
    describe('success cases', () => {
      it('should create a user successfully and return 201', async () => {
        (
          mockUserService.createUser as ReturnType<typeof vi.fn>
        ).mockResolvedValue(undefined);

        await controller.createUser(
          mockRequest as FastifyRequest<{ Body: CreateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(mockUserService.createUser).toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(201);
        expect(sendMock).toHaveBeenCalledWith();
      });

      it('should call userService.createUser with correct user data', async () => {
        (
          mockUserService.createUser as ReturnType<typeof vi.fn>
        ).mockResolvedValue(undefined);

        await controller.createUser(
          mockRequest as FastifyRequest<{ Body: CreateUserInputZod }>,
          mockReply as FastifyReply,
        );

        const createUserCall = (
          mockUserService.createUser as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];

        expect(createUserCall.email).toBe('test@example.com');
        expect(createUserCall.password).toBe('password123');
      });
    });

    describe('validation errors', () => {
      it('should handle invalid email and return 500', async () => {
        mockRequest.body = {
          email: 'invalid-email',
          password: 'password123',
        };

        await controller.createUser(
          mockRequest as FastifyRequest<{ Body: CreateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Internal server error',
        });
        expect(logErrorMock).toHaveBeenCalled();
      });

      it('should handle short password and return 500', async () => {
        mockRequest.body = {
          email: 'test@example.com',
          password: '12345',
        };

        await controller.createUser(
          mockRequest as FastifyRequest<{ Body: CreateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Internal server error',
        });
      });
    });

    describe('conflict errors', () => {
      it('should handle ConflictError and return 409', async () => {
        const conflictError = new ConflictError('Email already exists');

        (
          mockUserService.createUser as ReturnType<typeof vi.fn>
        ).mockRejectedValue(conflictError);

        await controller.createUser(
          mockRequest as FastifyRequest<{ Body: CreateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(409);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Email already exists',
          code: 'CONFLICT_ERROR',
        });
      });
    });

    describe('unexpected errors', () => {
      it('should handle generic Error and return 500', async () => {
        const genericError = new Error('Database connection failed');

        (
          mockUserService.createUser as ReturnType<typeof vi.fn>
        ).mockRejectedValue(genericError);

        await controller.createUser(
          mockRequest as FastifyRequest<{ Body: CreateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(logErrorMock).toHaveBeenCalledWith(
          genericError,
          'Unexpected error',
        );
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Internal server error',
        });
      });

      it('should handle string error', async () => {
        const stringError = 'Something went wrong';

        (
          mockUserService.createUser as ReturnType<typeof vi.fn>
        ).mockRejectedValue(stringError);

        await controller.createUser(
          mockRequest as FastifyRequest<{ Body: CreateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(logErrorMock).toHaveBeenCalledWith(
          stringError,
          'Unexpected error',
        );
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Internal server error',
        });
      });
    });

    describe('return values', () => {
      it('should return the reply object', async () => {
        (
          mockUserService.createUser as ReturnType<typeof vi.fn>
        ).mockResolvedValue(undefined);

        const result = await controller.createUser(
          mockRequest as FastifyRequest<{ Body: CreateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(result).toBeDefined();
      });

      it('should return reply object even on error', async () => {
        const error = new Error('Test error');

        (
          mockUserService.createUser as ReturnType<typeof vi.fn>
        ).mockRejectedValue(error);

        const result = await controller.createUser(
          mockRequest as FastifyRequest<{ Body: CreateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(result).toBeDefined();
      });
    });
  });

  describe('authenticateUser', () => {
    describe('success cases', () => {
      it('should authenticate user successfully and return 200', async () => {
        const authResult = {
          user: {
            _id: '123',
            email: 'test@example.com',
          },
          token: 'jwt-token-123',
        };

        (
          mockUserService.authenticateUser as ReturnType<typeof vi.fn>
        ).mockResolvedValue(authResult);

        await controller.authenticateUser(
          mockRequest as FastifyRequest<{ Body: AuthenticateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(mockUserService.authenticateUser).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
        );
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(sendMock).toHaveBeenCalledWith(authResult);
      });

      it('should call userService.authenticateUser with correct credentials', async () => {
        const authResult = {
          user: { _id: '123', email: 'test@example.com' },
          token: 'jwt-token-123',
        };

        (
          mockUserService.authenticateUser as ReturnType<typeof vi.fn>
        ).mockResolvedValue(authResult);

        await controller.authenticateUser(
          mockRequest as FastifyRequest<{ Body: AuthenticateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(mockUserService.authenticateUser).toHaveBeenCalledTimes(1);
        expect(mockUserService.authenticateUser).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
        );
      });
    });

    describe('not found errors', () => {
      it('should handle NotFoundError and return 404', async () => {
        const notFoundError = new NotFoundError('User not found.');

        (
          mockUserService.authenticateUser as ReturnType<typeof vi.fn>
        ).mockRejectedValue(notFoundError);

        await controller.authenticateUser(
          mockRequest as FastifyRequest<{ Body: AuthenticateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'User not found.',
          code: 'NOT_FOUND_ERROR',
        });
      });
    });

    describe('bad request errors', () => {
      it('should handle BadRequestError for invalid password and return 400', async () => {
        const badRequestError = new BadRequestError(
          'Invalid email or password.',
        );

        (
          mockUserService.authenticateUser as ReturnType<typeof vi.fn>
        ).mockRejectedValue(badRequestError);

        await controller.authenticateUser(
          mockRequest as FastifyRequest<{ Body: AuthenticateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Invalid email or password.',
          code: 'BAD_REQUEST_ERROR',
        });
      });
    });

    describe('unexpected errors', () => {
      it('should handle generic Error and return 500', async () => {
        const genericError = new Error('Database connection failed');

        (
          mockUserService.authenticateUser as ReturnType<typeof vi.fn>
        ).mockRejectedValue(genericError);

        await controller.authenticateUser(
          mockRequest as FastifyRequest<{ Body: AuthenticateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(logErrorMock).toHaveBeenCalledWith(
          genericError,
          'Unexpected error',
        );
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Internal server error',
        });
      });

      it('should handle string error', async () => {
        const stringError = 'Something went wrong';

        (
          mockUserService.authenticateUser as ReturnType<typeof vi.fn>
        ).mockRejectedValue(stringError);

        await controller.authenticateUser(
          mockRequest as FastifyRequest<{ Body: AuthenticateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(logErrorMock).toHaveBeenCalledWith(
          stringError,
          'Unexpected error',
        );
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Internal server error',
        });
      });
    });

    describe('return values', () => {
      it('should return the reply object', async () => {
        const authResult = {
          user: { _id: '123', email: 'test@example.com' },
          token: 'jwt-token-123',
        };

        (
          mockUserService.authenticateUser as ReturnType<typeof vi.fn>
        ).mockResolvedValue(authResult);

        const result = await controller.authenticateUser(
          mockRequest as FastifyRequest<{ Body: AuthenticateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(result).toBeDefined();
      });

      it('should return reply object even on error', async () => {
        const error = new Error('Test error');

        (
          mockUserService.authenticateUser as ReturnType<typeof vi.fn>
        ).mockRejectedValue(error);

        const result = await controller.authenticateUser(
          mockRequest as FastifyRequest<{ Body: AuthenticateUserInputZod }>,
          mockReply as FastifyReply,
        );

        expect(result).toBeDefined();
      });
    });
  });
});
