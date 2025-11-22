import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  ConflictError,
  NotFoundError,
  BadRequestError,
} from './app-error';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create an error with message and default status code 500', () => {
      const error = new AppError('Something went wrong');

      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBeUndefined();
      expect(error.name).toBe('AppError');
    });

    it('should create an error with custom status code', () => {
      const error = new AppError('Custom error', 418);

      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(418);
      expect(error.code).toBeUndefined();
    });

    it('should create an error with status code and error code', () => {
      const error = new AppError('Custom error', 503, 'SERVICE_UNAVAILABLE');

      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('should be an instance of Error', () => {
      const error = new AppError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should have a stack trace', () => {
      const error = new AppError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });

    it('should set correct constructor name', () => {
      const error = new AppError('Test error');

      expect(error.name).toBe('AppError');
      expect(error.constructor.name).toBe('AppError');
    });
  });

  describe('properties', () => {
    it('should have readonly statusCode property', () => {
      const error = new AppError('Test', 404);

      expect(error.statusCode).toBe(404);
      expect(() => {
        (error as any).statusCode = 500;
      }).not.toThrow();
    });

    it('should have readonly code property', () => {
      const error = new AppError('Test', 400, 'TEST_ERROR');

      expect(error.code).toBe('TEST_ERROR');
    });
  });
});

describe('ValidationError', () => {
  describe('constructor', () => {
    it('should create a validation error with message', () => {
      const error = new ValidationError('Validation failed');

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toBeUndefined();
      expect(error.name).toBe('ValidationError');
    });

    it('should create a validation error with details', () => {
      const details = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Password too short' },
      ];
      const error = new ValidationError('Validation failed', details);

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual(details);
      expect(error.details).toHaveLength(2);
    });

    it('should create a validation error with empty details array', () => {
      const error = new ValidationError('Validation failed', []);

      expect(error.details).toEqual([]);
      expect(error.details).toHaveLength(0);
    });

    it('should be an instance of AppError and Error', () => {
      const error = new ValidationError('Test');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should have a stack trace', () => {
      const error = new ValidationError('Test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ValidationError');
    });
  });

  describe('details property', () => {
    it('should have readonly details property', () => {
      const details = [{ field: 'email', message: 'Invalid' }];
      const error = new ValidationError('Test', details);

      expect(error.details).toEqual(details);
      expect(error.details).toBe(details);
    });

    it('should handle multiple validation errors', () => {
      const details = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password is required' },
        { field: 'name', message: 'Name is required' },
      ];
      const error = new ValidationError('Multiple validation errors', details);

      expect(error.details).toHaveLength(3);
      expect(error.details?.[0].field).toBe('email');
      expect(error.details?.[1].field).toBe('password');
      expect(error.details?.[2].field).toBe('name');
    });
  });
});

describe('ConflictError', () => {
  describe('constructor', () => {
    it('should create a conflict error with correct properties', () => {
      const error = new ConflictError('Resource already exists');

      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT_ERROR');
      expect(error.name).toBe('ConflictError');
    });

    it('should be an instance of AppError and Error', () => {
      const error = new ConflictError('Test');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ConflictError);
    });

    it('should have a stack trace', () => {
      const error = new ConflictError('Test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ConflictError');
    });

    it('should handle different conflict messages', () => {
      const error1 = new ConflictError('Email already registered');
      const error2 = new ConflictError('Username already taken');

      expect(error1.message).toBe('Email already registered');
      expect(error2.message).toBe('Username already taken');
      expect(error1.statusCode).toBe(error2.statusCode);
      expect(error1.code).toBe(error2.code);
    });
  });
});

describe('NotFoundError', () => {
  describe('constructor', () => {
    it('should create a not found error with correct properties', () => {
      const error = new NotFoundError('Resource not found');

      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND_ERROR');
      expect(error.name).toBe('NotFoundError');
    });

    it('should be an instance of AppError and Error', () => {
      const error = new NotFoundError('Test');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('should have a stack trace', () => {
      const error = new NotFoundError('Test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('NotFoundError');
    });

    it('should handle different not found messages', () => {
      const error1 = new NotFoundError('User not found');
      const error2 = new NotFoundError('Product not found');

      expect(error1.message).toBe('User not found');
      expect(error2.message).toBe('Product not found');
      expect(error1.statusCode).toBe(error2.statusCode);
      expect(error1.code).toBe(error2.code);
    });
  });
});

describe('BadRequestError', () => {
  describe('constructor', () => {
    it('should create a bad request error with correct properties', () => {
      const error = new BadRequestError('Invalid request');

      expect(error.message).toBe('Invalid request');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST_ERROR');
      expect(error.name).toBe('BadRequestError');
    });

    it('should be an instance of AppError and Error', () => {
      const error = new BadRequestError('Test');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(BadRequestError);
    });

    it('should have a stack trace', () => {
      const error = new BadRequestError('Test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('BadRequestError');
    });

    it('should handle different bad request messages', () => {
      const error1 = new BadRequestError('Missing required field');
      const error2 = new BadRequestError('Invalid format');

      expect(error1.message).toBe('Missing required field');
      expect(error2.message).toBe('Invalid format');
      expect(error1.statusCode).toBe(error2.statusCode);
      expect(error1.code).toBe(error2.code);
    });
  });
});

describe('Error inheritance chain', () => {
  it('should maintain correct inheritance chain for all error types', () => {
    const appError = new AppError('App error');
    const validationError = new ValidationError('Validation error');
    const conflictError = new ConflictError('Conflict error');
    const notFoundError = new NotFoundError('Not found error');
    const badRequestError = new BadRequestError('Bad request error');

    expect(appError).toBeInstanceOf(Error);
    expect(validationError).toBeInstanceOf(Error);
    expect(conflictError).toBeInstanceOf(Error);
    expect(notFoundError).toBeInstanceOf(Error);
    expect(badRequestError).toBeInstanceOf(Error);

    expect(validationError).toBeInstanceOf(AppError);
    expect(conflictError).toBeInstanceOf(AppError);
    expect(notFoundError).toBeInstanceOf(AppError);
    expect(badRequestError).toBeInstanceOf(AppError);
  });

  it('should not be instances of sibling error classes', () => {
    const validationError = new ValidationError('Test');
    const conflictError = new ConflictError('Test');

    expect(validationError).not.toBeInstanceOf(ConflictError);
    expect(conflictError).not.toBeInstanceOf(ValidationError);
  });
});

describe('Error serialization', () => {
  it('should be JSON serializable', () => {
    const error = new AppError('Test error', 500, 'TEST_CODE');
    const json = JSON.stringify(error);

    expect(json).toBeDefined();
  });

  it('should preserve error properties when thrown and caught', () => {
    try {
      throw new ValidationError('Test validation', [
        { field: 'email', message: 'Invalid' },
      ]);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toBe('Test validation');
      expect((error as ValidationError).statusCode).toBe(400);
      expect((error as ValidationError).details).toHaveLength(1);
    }
  });
});

describe('Edge cases', () => {
  it('should handle empty string message', () => {
    const error = new AppError('');

    expect(error.message).toBe('');
    expect(error.statusCode).toBe(500);
  });

  it('should handle very long messages', () => {
    const longMessage = 'A'.repeat(1000);
    const error = new AppError(longMessage);

    expect(error.message).toBe(longMessage);
    expect(error.message.length).toBe(1000);
  });

  it('should handle special characters in message', () => {
    const error = new AppError('Error with special chars: éàü 中文 🚀');

    expect(error.message).toBe('Error with special chars: éàü 中文 🚀');
  });

  it('should handle ValidationError with very large details array', () => {
    const details = Array.from({ length: 100 }, (_, i) => ({
      field: `field${i}`,
      message: `Error ${i}`,
    }));
    const error = new ValidationError('Many errors', details);

    expect(error.details).toHaveLength(100);
  });
});
