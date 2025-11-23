import type { Db } from 'mongodb';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { CryptoProvider } from '../provider/crypto.provider';
import { JwtProvider } from '../provider/jwt.provider';

export class UserControllerFactory {
  static create(db: Db): UserController {
    const userCollection = db.collection('users');
    const userRepository = new UserRepository(userCollection as any);
    const cryptoProvider = new CryptoProvider();
    const jwtProvider = new JwtProvider();
    const userService = new UserService(
      userRepository,
      cryptoProvider,
      jwtProvider,
    );

    return new UserController(userService);
  }
}
