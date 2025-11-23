import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CryptoProvider } from './crypto.provider';
import bcrypt from 'bcrypt';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

describe('CryptoProvider', () => {
  let cryptoProvider: CryptoProvider;

  beforeEach(() => {
    cryptoProvider = new CryptoProvider();
    vi.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'password123';
      const hashedPassword = '$2b$10$hashedPasswordExample';

      (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue(
        hashedPassword,
      );

      const result = await cryptoProvider.hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(result).toBe(hashedPassword);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use SALT_ROUNDS constant (10)', async () => {
      const password = 'testPassword';

      (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue(
        '$2b$10$hashed',
      );

      await cryptoProvider.hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });

    it('should hash different passwords differently', async () => {
      const password1 = 'password1';
      const password2 = 'password2';
      const hash1 = '$2b$10$hash1';
      const hash2 = '$2b$10$hash2';

      (bcrypt.hash as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(hash1)
        .mockResolvedValueOnce(hash2);

      const result1 = await cryptoProvider.hashPassword(password1);
      const result2 = await cryptoProvider.hashPassword(password2);

      expect(result1).toBe(hash1);
      expect(result2).toBe(hash2);
      expect(result1).not.toBe(result2);
    });

    it('should handle bcrypt errors', async () => {
      const password = 'password123';
      const error = new Error('bcrypt hashing failed');

      (bcrypt.hash as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      await expect(cryptoProvider.hashPassword(password)).rejects.toThrow(
        'bcrypt hashing failed',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('comparePassword', () => {
    it('should return true when password matches hash', async () => {
      const password = 'password123';
      const hashedPassword = '$2b$10$hashedPasswordExample';

      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const result = await cryptoProvider.comparePassword(
        password,
        hashedPassword,
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('should return false when password does not match hash', async () => {
      const password = 'wrongPassword';
      const hashedPassword = '$2b$10$hashedPasswordExample';

      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const result = await cryptoProvider.comparePassword(
        password,
        hashedPassword,
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    it('should compare password with hash correctly', async () => {
      const password = 'correctPassword';
      const hashedPassword = '$2b$10$correctHash';

      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const result = await cryptoProvider.comparePassword(
        password,
        hashedPassword,
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should handle bcrypt compare errors', async () => {
      const password = 'password123';
      const hashedPassword = '$2b$10$invalidHash';
      const error = new Error('bcrypt compare failed');

      (bcrypt.compare as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      await expect(
        cryptoProvider.comparePassword(password, hashedPassword),
      ).rejects.toThrow('bcrypt compare failed');
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });

  describe('integration between hashPassword and comparePassword', () => {
    it('should verify that hashed password matches original password', async () => {
      const password = 'originalPassword';
      const hashedPassword = '$2b$10$integratedHash';

      (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue(
        hashedPassword,
      );
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const hash = await cryptoProvider.hashPassword(password);
      const isValid = await cryptoProvider.comparePassword(password, hash);

      expect(hash).toBe(hashedPassword);
      expect(isValid).toBe(true);
    });
  });
});
