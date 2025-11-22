import { describe, it, expect } from 'vitest';
import { ObjectId } from 'mongodb';
import { User } from './user.domain';

describe('User', () => {
  describe('create', () => {
    it('should create a user with valid data', () => {
      const user = User.create({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('password123');
      expect(user._id).toBeUndefined();
      expect(user.createdAt).toBeUndefined();
      expect(user.updatedAt).toBeUndefined();
    });

    it('should throw error for invalid email', () => {
      expect(() =>
        User.create({
          email: 'invalid-email',
          password: 'password123',
        }),
      ).toThrow('Invalid email format');
    });

    it('should throw error for empty email', () => {
      expect(() =>
        User.create({
          email: '',
          password: 'password123',
        }),
      ).toThrow('Invalid email format');
    });

    it('should throw error for short password', () => {
      expect(() =>
        User.create({
          email: 'test@example.com',
          password: '12345',
        }),
      ).toThrow('Password must be at least 6 characters long');
    });

    it('should throw error for long password', () => {
      const longPassword = 'a'.repeat(101);
      expect(() =>
        User.create({
          email: 'test@example.com',
          password: longPassword,
        }),
      ).toThrow('Password must not exceed 100 characters');
    });
  });

  describe('fromPersistence', () => {
    it('should create user from persistence data', () => {
      const id = new ObjectId();
      const createdAt = new Date();
      const updatedAt = new Date();

      const user = User.fromPersistence({
        _id: id,
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt,
        updatedAt,
      });

      expect(user._id).toBe(id);
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('hashedPassword');
      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(updatedAt);
    });

    it('should create user from persistence data without dates', () => {
      const id = new ObjectId();

      const user = User.fromPersistence({
        _id: id,
        email: 'test@example.com',
        password: 'hashedPassword',
      });

      expect(user._id).toBe(id);
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('hashedPassword');
      expect(user.createdAt).toBeUndefined();
      expect(user.updatedAt).toBeUndefined();
    });
  });

  describe('toPersistence', () => {
    it('should convert user to persistence format', () => {
      const user = User.create({
        email: 'test@example.com',
        password: 'password123',
      });

      const persistence = user.toPersistence();

      expect(persistence).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should include dates in persistence format when present', () => {
      const id = new ObjectId();
      const createdAt = new Date();
      const updatedAt = new Date();

      const user = User.fromPersistence({
        _id: id,
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt,
        updatedAt,
      });

      const persistence = user.toPersistence();

      expect(persistence).toEqual({
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt,
        updatedAt,
      });
    });
  });

  describe('isEmailValid', () => {
    it('should return true for valid email', () => {
      const user = User.create({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(user.isEmailValid()).toBe(true);
    });

    it('should return true for valid email with subdomains', () => {
      const user = User.create({
        email: 'test@mail.example.com',
        password: 'password123',
      });

      expect(user.isEmailValid()).toBe(true);
    });
  });

  describe('hasStrongPassword', () => {
    it('should return false for password less than 8 characters', () => {
      const user = User.create({
        email: 'test@example.com',
        password: 'pass123',
      });

      expect(user.hasStrongPassword()).toBe(false);
    });

    it('should return true for password with 8 or more characters', () => {
      const user = User.create({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(user.hasStrongPassword()).toBe(true);
    });
  });
});
