import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepository } from './user.repository';
import type { Collection } from 'mongodb';
import type { User } from '../schema/user';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockCollection: {
    findOne: ReturnType<typeof vi.fn>;
    insertOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockCollection = {
      findOne: vi.fn(),
      insertOne: vi.fn(),
    };

    userRepository = new UserRepository(
      mockCollection as unknown as Collection,
    );
  });

  describe('findOneByEmail', () => {
    it('should find a user by email successfully', async () => {
      const email = 'test@example.com';
      const mockUser: User = {
        _id: { toString: () => '123' } as unknown as import('mongodb').ObjectId,
        email,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCollection.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findOneByEmail(email);

      expect(mockCollection.findOne).toHaveBeenCalledWith({ email });
      expect(mockCollection.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      const email = 'nonexistent@example.com';

      mockCollection.findOne.mockResolvedValue(null);

      const result = await userRepository.findOneByEmail(email);

      expect(mockCollection.findOne).toHaveBeenCalledWith({ email });
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const email = 'test@example.com';
      const error = new Error('Database connection failed');

      mockCollection.findOne.mockRejectedValue(error);

      await expect(userRepository.findOneByEmail(email)).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockCollection.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData: Partial<User> = {
        email: 'newuser@example.com',
        password: 'hashedPassword123',
        createdAt: new Date(),
      };

      const mockInsertResult = {
        insertedId: { toString: () => 'newId123' },
        acknowledged: true,
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      const result = await userRepository.create(userData);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(userData);
      expect(mockCollection.insertOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockInsertResult);
      expect(result.insertedId).toBeDefined();
    });

    it('should create user with minimal data', async () => {
      const userData: Partial<User> = {
        email: 'minimal@example.com',
        password: 'password123',
      };

      const mockInsertResult = {
        insertedId: { toString: () => 'minimalId' },
        acknowledged: true,
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      const result = await userRepository.create(userData);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockInsertResult);
    });

    it('should create user with all fields', async () => {
      const userData: Partial<User> = {
        email: 'complete@example.com',
        password: 'hashedPassword',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const mockInsertResult = {
        insertedId: { toString: () => 'completeId' },
        acknowledged: true,
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      const result = await userRepository.create(userData);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(userData);
      expect(result.insertedId).toBeDefined();
    });

    it('should handle database errors on create', async () => {
      const userData: Partial<User> = {
        email: 'error@example.com',
        password: 'password123',
      };
      const error = new Error('Duplicate key error');

      mockCollection.insertOne.mockRejectedValue(error);

      await expect(userRepository.create(userData)).rejects.toThrow(
        'Duplicate key error',
      );
      expect(mockCollection.insertOne).toHaveBeenCalledWith(userData);
    });
  });
});
