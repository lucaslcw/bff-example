import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { CryptoProvider } from '../provider/crypto.provider';
import { JwtProvider } from '../provider/jwt.provider';
import { User } from '../domain/user.domain';
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '../errors/app-error';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: {
    findOneByEmail: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let mockCryptoProvider: {
    hashPassword: ReturnType<typeof vi.fn>;
    comparePassword: ReturnType<typeof vi.fn>;
  };
  let mockJwtProvider: {
    sign: ReturnType<typeof vi.fn>;
    verify: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockUserRepository = {
      findOneByEmail: vi.fn(),
      create: vi.fn(),
    };

    mockCryptoProvider = {
      hashPassword: vi.fn(),
      comparePassword: vi.fn(),
    };

    mockJwtProvider = {
      sign: vi.fn(),
      verify: vi.fn(),
    };

    userService = new UserService(
      mockUserRepository as unknown as UserRepository,
      mockCryptoProvider as unknown as CryptoProvider,
      mockJwtProvider as unknown as JwtProvider,
    );
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const user = User.create({
        email: 'test@example.com',
        password: 'password123',
      });
      const hashedPassword = 'hashedPassword123';

      mockUserRepository.findOneByEmail.mockResolvedValue(null);
      mockCryptoProvider.hashPassword.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue({
        insertedId: { toString: () => '123' },
      });

      await userService.createUser(user);

      expect(mockUserRepository.findOneByEmail).toHaveBeenCalledWith(
        user.email,
      );
      expect(mockCryptoProvider.hashPassword).toHaveBeenCalledWith(
        user.password,
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: user.email,
        password: hashedPassword,
      });
    });

    it('should throw ConflictError when user already exists', async () => {
      const user = User.create({
        email: 'existing@example.com',
        password: 'password123',
      });

      mockUserRepository.findOneByEmail.mockResolvedValue({
        email: user.email,
        _id: '123',
      });

      await expect(userService.createUser(user)).rejects.toThrow(ConflictError);
      await expect(userService.createUser(user)).rejects.toThrow(
        'There is already a user with this email.',
      );

      expect(mockCryptoProvider.hashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user successfully with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      const mockToken = 'mock.jwt.token';

      const mockUser = {
        _id: { toString: () => '123' },
        email,
        password: hashedPassword,
      };

      mockUserRepository.findOneByEmail.mockResolvedValue(mockUser);
      mockCryptoProvider.comparePassword.mockResolvedValue(true);
      mockJwtProvider.sign.mockReturnValue(mockToken);

      const result = await userService.authenticateUser(email, password);

      expect(mockUserRepository.findOneByEmail).toHaveBeenCalledWith(email);
      expect(mockCryptoProvider.comparePassword).toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
      expect(mockJwtProvider.sign).toHaveBeenCalledWith({
        userId: '123',
        email,
      });
      expect(result).toEqual({ user: mockUser, token: mockToken });
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockUserRepository.findOneByEmail.mockResolvedValue(null);

      await expect(
        userService.authenticateUser(email, password),
      ).rejects.toThrow(NotFoundError);
      await expect(
        userService.authenticateUser(email, password),
      ).rejects.toThrow('User not found.');

      expect(mockCryptoProvider.comparePassword).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when password does not match', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';
      const hashedPassword = 'hashedPassword123';

      const mockUser = {
        _id: '123',
        email,
        password: hashedPassword,
      };

      mockUserRepository.findOneByEmail.mockResolvedValue(mockUser);
      mockCryptoProvider.comparePassword.mockResolvedValue(false);

      await expect(
        userService.authenticateUser(email, password),
      ).rejects.toThrow(BadRequestError);
      await expect(
        userService.authenticateUser(email, password),
      ).rejects.toThrow('Invalid email or password.');

      expect(mockUserRepository.findOneByEmail).toHaveBeenCalledWith(email);
      expect(mockCryptoProvider.comparePassword).toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
    });
  });
});
