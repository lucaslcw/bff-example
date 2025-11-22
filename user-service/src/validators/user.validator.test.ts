import { describe, it, expect, beforeEach } from 'vitest';
import { UserValidator } from './user.validator';
import { ValidationError } from '../errors/app-error';

describe('UserValidator', () => {
  let validator: UserValidator;

  beforeEach(() => {
    validator = new UserValidator();
  });

  describe('validateCreateUser', () => {
    it('should validate correct user data successfully', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = validator.validateCreateUser(validData);

      expect(result).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should accept minimum password length (6 characters)', () => {
      const validData = {
        email: 'test@example.com',
        password: '123456',
      };

      const result = validator.validateCreateUser(validData);

      expect(result.password).toBe('123456');
    });

    it('should accept maximum password length (100 characters)', () => {
      const validData = {
        email: 'test@example.com',
        password: 'a'.repeat(100),
      };

      const result = validator.validateCreateUser(validData);

      expect(result.password).toHaveLength(100);
    });

    describe('email validation', () => {
      it('should throw ValidationError when email is missing', () => {
        const invalidData = {
          password: 'password123',
        };

        expect(() => validator.validateCreateUser(invalidData)).toThrow(
          ValidationError,
        );

        try {
          validator.validateCreateUser(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).message).toBe('Validation failed');
          expect((error as ValidationError).statusCode).toBe(400);
          expect((error as ValidationError).code).toBe('VALIDATION_ERROR');
          expect((error as ValidationError).details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: expect.any(String),
              }),
            ]),
          );
        }
      });

      it('should throw ValidationError when email is empty string', () => {
        const invalidData = {
          email: '',
          password: 'password123',
        };

        expect(() => validator.validateCreateUser(invalidData)).toThrow(
          ValidationError,
        );

        try {
          validator.validateCreateUser(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: expect.stringContaining('Email is required'),
              }),
            ]),
          );
        }
      });

      it('should throw ValidationError when email format is invalid', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'password123',
        };

        expect(() => validator.validateCreateUser(invalidData)).toThrow(
          ValidationError,
        );

        try {
          validator.validateCreateUser(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: 'Invalid email format',
              }),
            ]),
          );
        }
      });

      it('should throw ValidationError for email without @', () => {
        const invalidData = {
          email: 'notanemail.com',
          password: 'password123',
        };

        expect(() => validator.validateCreateUser(invalidData)).toThrow(
          ValidationError,
        );
      });

      it('should throw ValidationError for email without domain', () => {
        const invalidData = {
          email: 'test@',
          password: 'password123',
        };

        expect(() => validator.validateCreateUser(invalidData)).toThrow(
          ValidationError,
        );
      });

      it('should accept valid email with subdomain', () => {
        const validData = {
          email: 'test@mail.example.com',
          password: 'password123',
        };

        const result = validator.validateCreateUser(validData);

        expect(result.email).toBe('test@mail.example.com');
      });

      it('should accept valid email with plus sign', () => {
        const validData = {
          email: 'test+tag@example.com',
          password: 'password123',
        };

        const result = validator.validateCreateUser(validData);

        expect(result.email).toBe('test+tag@example.com');
      });
    });

    describe('password validation', () => {
      it('should throw ValidationError when password is missing', () => {
        const invalidData = {
          email: 'test@example.com',
        };

        expect(() => validator.validateCreateUser(invalidData)).toThrow(
          ValidationError,
        );

        try {
          validator.validateCreateUser(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'password',
                message: expect.any(String),
              }),
            ]),
          );
        }
      });

      it('should throw ValidationError when password is too short (less than 6 characters)', () => {
        const invalidData = {
          email: 'test@example.com',
          password: '12345',
        };

        expect(() => validator.validateCreateUser(invalidData)).toThrow(
          ValidationError,
        );

        try {
          validator.validateCreateUser(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'password',
                message: 'Password must be at least 6 characters long',
              }),
            ]),
          );
        }
      });

      it('should throw ValidationError when password is too long (more than 100 characters)', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'a'.repeat(101),
        };

        expect(() => validator.validateCreateUser(invalidData)).toThrow(
          ValidationError,
        );

        try {
          validator.validateCreateUser(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'password',
                message: 'Password must not exceed 100 characters',
              }),
            ]),
          );
        }
      });

      it('should throw ValidationError when password is empty string', () => {
        const invalidData = {
          email: 'test@example.com',
          password: '',
        };

        expect(() => validator.validateCreateUser(invalidData)).toThrow(
          ValidationError,
        );
      });
    });

    describe('multiple validation errors', () => {
      it('should throw ValidationError with multiple error details when both email and password are invalid', () => {
        const invalidData = {
          email: 'invalid-email',
          password: '123',
        };

        expect(() => validator.validateCreateUser(invalidData)).toThrow(
          ValidationError,
        );

        try {
          validator.validateCreateUser(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).details).toHaveLength(2);
          expect((error as ValidationError).details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: 'Invalid email format',
              }),
              expect.objectContaining({
                field: 'password',
                message: 'Password must be at least 6 characters long',
              }),
            ]),
          );
        }
      });

      it('should throw ValidationError when both fields are missing', () => {
        const invalidData = {};

        expect(() => validator.validateCreateUser(invalidData)).toThrow(
          ValidationError,
        );

        try {
          validator.validateCreateUser(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).details).toHaveLength(2);
        }
      });
    });

    describe('edge cases', () => {
      it('should throw ValidationError when input is null', () => {
        expect(() => validator.validateCreateUser(null)).toThrow(
          ValidationError,
        );
      });

      it('should throw ValidationError when input is undefined', () => {
        expect(() => validator.validateCreateUser(undefined)).toThrow(
          ValidationError,
        );
      });

      it('should throw ValidationError when input is not an object', () => {
        expect(() => validator.validateCreateUser('string')).toThrow(
          ValidationError,
        );
      });

      it('should throw ValidationError when input is an array', () => {
        expect(() => validator.validateCreateUser([])).toThrow(ValidationError);
      });

      it('should throw ValidationError when input is a number', () => {
        expect(() => validator.validateCreateUser(123)).toThrow(
          ValidationError,
        );
      });

      it('should ignore extra fields not in schema', () => {
        const dataWithExtraFields = {
          email: 'test@example.com',
          password: 'password123',
          extraField: 'should be stripped',
          anotherExtra: 123,
        };

        const result = validator.validateCreateUser(dataWithExtraFields);

        expect(result).toEqual({
          email: 'test@example.com',
          password: 'password123',
        });
        expect(result).not.toHaveProperty('extraField');
        expect(result).not.toHaveProperty('anotherExtra');
      });
    });

    describe('type coercion', () => {
      it('should throw ValidationError when email is a number', () => {
        const invalidData = {
          email: 12345,
          password: 'password123',
        };

        expect(() => validator.validateCreateUser(invalidData)).toThrow(
          ValidationError,
        );
      });

      it('should throw ValidationError when password is a number', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 123456,
        };

        expect(() => validator.validateCreateUser(invalidData)).toThrow(
          ValidationError,
        );
      });

      it('should throw ValidationError when email is a boolean', () => {
        const invalidData = {
          email: true,
          password: 'password123',
        };

        expect(() => validator.validateCreateUser(invalidData)).toThrow(
          ValidationError,
        );
      });
    });
  });
});
