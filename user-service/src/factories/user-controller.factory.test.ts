import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserControllerFactory } from './user-controller.factory';
import { UserController } from '../controllers/user.controller';
import type { Db } from 'mongodb';

describe('UserControllerFactory', () => {
  let mockDb: Partial<Db>;
  let mockCollection: any;

  beforeEach(() => {
    mockCollection = {
      findOne: vi.fn(),
      insertOne: vi.fn(),
      updateOne: vi.fn(),
      deleteOne: vi.fn(),
    };

    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    };
  });

  describe('create', () => {
    it('should create a UserController instance', () => {
      const controller = UserControllerFactory.create(mockDb as Db);

      expect(controller).toBeInstanceOf(UserController);
    });

    it('should call db.collection with "users"', () => {
      UserControllerFactory.create(mockDb as Db);

      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockDb.collection).toHaveBeenCalledTimes(1);
    });

    it('should create controller with all dependencies wired correctly', () => {
      const controller = UserControllerFactory.create(mockDb as Db);

      expect(controller).toBeDefined();
      expect(controller.createUser).toBeDefined();
      expect(typeof controller.createUser).toBe('function');
    });

    it('should create a new instance each time', () => {
      const controller1 = UserControllerFactory.create(mockDb as Db);
      const controller2 = UserControllerFactory.create(mockDb as Db);

      expect(controller1).not.toBe(controller2);
    });

    it('should handle database collection creation', () => {
      const collectionSpy = vi.spyOn(mockDb, 'collection' as any);

      UserControllerFactory.create(mockDb as Db);

      expect(collectionSpy).toHaveBeenCalledWith('users');
    });
  });
});
