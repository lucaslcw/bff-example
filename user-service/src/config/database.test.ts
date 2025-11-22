import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DatabaseHelper } from './database';
import type { Db } from 'mongodb';
import type { FastifyInstance } from 'fastify';

describe('DatabaseHelper', () => {
  let mockDb: Partial<Db>;
  let mockLogger: Partial<FastifyInstance['log']>;
  let listCollectionsMock: ReturnType<typeof vi.fn>;
  let toArrayMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();

    toArrayMock = vi.fn();
    listCollectionsMock = vi.fn().mockReturnValue({ toArray: toArrayMock });

    mockDb = {
      listCollections: listCollectionsMock as any,
    };

    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as any;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('verifyConnection', () => {
    it('should verify connection successfully on first try', async () => {
      toArrayMock.mockResolvedValue([]);

      await DatabaseHelper.verifyConnection(
        mockDb as Db,
        mockLogger as FastifyInstance['log'],
      );

      expect(listCollectionsMock).toHaveBeenCalled();
      expect(toArrayMock).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'MongoDB connection verified',
      );
    });

    it('should use default maxRetries (5) and retryDelay (1000)', async () => {
      toArrayMock.mockResolvedValue([]);

      await DatabaseHelper.verifyConnection(
        mockDb as Db,
        mockLogger as FastifyInstance['log'],
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'MongoDB connection verified',
      );
    });

    it('should retry on connection failure and succeed', async () => {
      toArrayMock
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce([]);

      const verifyPromise = DatabaseHelper.verifyConnection(
        mockDb as Db,
        mockLogger as FastifyInstance['log'],
      );

      await vi.runAllTimersAsync();

      await verifyPromise;

      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'MongoDB connection test failed, retrying... (4 left)',
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'MongoDB connection test failed, retrying... (3 left)',
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'MongoDB connection verified',
      );
    });

    it('should throw error after max retries', async () => {
      vi.useRealTimers();

      const error = new Error('Connection failed');
      toArrayMock.mockRejectedValue(error);

      await expect(
        DatabaseHelper.verifyConnection(
          mockDb as Db,
          mockLogger as FastifyInstance['log'],
          {
            maxRetries: 3,
            retryDelay: 10,
          },
        ),
      ).rejects.toThrow('Connection failed');

      vi.useFakeTimers();
    });

    it('should use custom maxRetries', async () => {
      vi.useRealTimers();

      toArrayMock.mockRejectedValue(new Error('Connection failed'));

      await expect(
        DatabaseHelper.verifyConnection(
          mockDb as Db,
          mockLogger as FastifyInstance['log'],
          { maxRetries: 2, retryDelay: 10 },
        ),
      ).rejects.toThrow();

      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'MongoDB connection test failed, retrying... (1 left)',
      );

      vi.useFakeTimers();
    });

    it('should use custom retryDelay', async () => {
      toArrayMock
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce([]);

      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      const verifyPromise = DatabaseHelper.verifyConnection(
        mockDb as Db,
        mockLogger as FastifyInstance['log'],
        { retryDelay: 2000 },
      );

      await vi.runAllTimersAsync();

      await verifyPromise;

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
    });

    it('should log correct retry count', async () => {
      toArrayMock
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'))
        .mockResolvedValueOnce([]);

      const verifyPromise = DatabaseHelper.verifyConnection(
        mockDb as Db,
        mockLogger as FastifyInstance['log'],
        { maxRetries: 5 },
      );

      await vi.runAllTimersAsync();

      await verifyPromise;

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'MongoDB connection test failed, retrying... (4 left)',
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'MongoDB connection test failed, retrying... (3 left)',
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'MongoDB connection test failed, retrying... (2 left)',
      );
    });

    it('should return successfully without retries if first attempt succeeds', async () => {
      toArrayMock.mockResolvedValue([{ name: 'users' }]);

      await DatabaseHelper.verifyConnection(
        mockDb as Db,
        mockLogger as FastifyInstance['log'],
      );

      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledTimes(1);
    });

    it('should handle different error types', async () => {
      vi.useRealTimers();

      const customError = new Error('Custom database error');
      toArrayMock.mockRejectedValue(customError);

      await expect(
        DatabaseHelper.verifyConnection(
          mockDb as Db,
          mockLogger as FastifyInstance['log'],
          { maxRetries: 1, retryDelay: 10 },
        ),
      ).rejects.toThrow('Custom database error');

      vi.useFakeTimers();
    });
  });
});
