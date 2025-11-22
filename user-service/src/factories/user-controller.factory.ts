import type { Db } from 'mongodb';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { CryptoProvider } from '../provider/crypto';

export class UserControllerFactory {
  static create(db: Db): UserController {
    const userCollection = db.collection('users');
    const userRepository = new UserRepository(userCollection as any);
    const cryptoProvider = new CryptoProvider();
    const userService = new UserService(userRepository, cryptoProvider);

    return new UserController(userService);
  }
}
