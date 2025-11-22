import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorHandler } from './error-handler.helper';
import {
  AppError,
  ValidationError,
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '../errors/app-error';
import type { FastifyRequest, FastifyReply } from 'fastify';

describe('ErrorHandler', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let statusMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;
  let logErrorMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    logErrorMock = vi.fn();
    sendMock = vi.fn().mockReturnThis();
    statusMock = vi.fn().mockReturnValue({ send: sendMock });

    mockRequest = {
      log: {
        error: logErrorMock,
      } as any,
    };

    mockReply = {
      status: statusMock,
    } as any;
  });

  describe('handle', () => {
    describe('ValidationError', () => {
      it('should handle ValidationError with 400 status and include details', () => {
        const details = [
          { field: 'email', message: 'Invalid email' },
          { field: 'password', message: 'Password too short' },
        ];
        const error = new ValidationError('Validation failed', details);

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details,
        });
      });

      it('should handle ValidationError without details', () => {
        const error = new ValidationError('Validation failed');

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
        });
      });
    });

    describe('ConflictError', () => {
      it('should handle ConflictError with 409 status', () => {
        const error = new ConflictError('Resource already exists');

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(409);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Resource already exists',
          code: 'CONFLICT_ERROR',
        });
      });
    });

    describe('NotFoundError', () => {
      it('should handle NotFoundError with 404 status', () => {
        const error = new NotFoundError('Resource not found');

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Resource not found',
          code: 'NOT_FOUND_ERROR',
        });
      });
    });

    describe('BadRequestError', () => {
      it('should handle BadRequestError with 400 status', () => {
        const error = new BadRequestError('Bad request');

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Bad request',
          code: 'BAD_REQUEST_ERROR',
        });
      });
    });

    describe('Generic AppError', () => {
      it('should handle AppError with custom status code', () => {
        const error = new AppError('Custom error', 418, 'CUSTOM_ERROR');

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(418);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Custom error',
          code: 'CUSTOM_ERROR',
        });
      });

      it('should handle AppError without error code', () => {
        const error = new AppError('Error without code', 500);

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Error without code',
        });
      });

      it('should handle AppError with status code 409 (not ConflictError instance)', () => {
        const error = new AppError('Conflict', 409);

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(409);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Conflict',
        });
      });

      it('should handle AppError with status code 404 (not NotFoundError instance)', () => {
        const error = new AppError('Not found', 404);

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Not found',
        });
      });

      it('should handle AppError with status code 400 (not BadRequestError instance)', () => {
        const error = new AppError('Bad request', 400);

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Bad request',
        });
      });
    });

    describe('Unexpected errors', () => {
      it('should handle generic Error with 500 status', () => {
        const error = new Error('Unexpected error');

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(logErrorMock).toHaveBeenCalledWith(error, 'Unexpected error');
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Internal server error',
        });
      });

      it('should handle string error', () => {
        const error = 'String error';

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(logErrorMock).toHaveBeenCalledWith(error, 'Unexpected error');
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Internal server error',
        });
      });

      it('should handle null error', () => {
        const error = null;

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(logErrorMock).toHaveBeenCalledWith(error, 'Unexpected error');
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Internal server error',
        });
      });

      it('should handle undefined error', () => {
        const error = undefined;

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(logErrorMock).toHaveBeenCalledWith(error, 'Unexpected error');
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Internal server error',
        });
      });

      it('should handle object error', () => {
        const error = { custom: 'error object' };

        ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(logErrorMock).toHaveBeenCalledWith(error, 'Unexpected error');
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(sendMock).toHaveBeenCalledWith({
          error: 'Internal server error',
        });
      });
    });

    describe('Return value', () => {
      it('should return the reply object', () => {
        const error = new NotFoundError('Not found');

        const result = ErrorHandler.handle(
          error,
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        expect(result).toBeDefined();
      });
    });
  });
});
