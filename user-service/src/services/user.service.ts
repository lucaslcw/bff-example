import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '../errors/app-error';
import { CryptoProvider } from '../provider/crypto.provider';
import { JwtProvider } from '../provider/jwt.provider';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../domain/user.domain';

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoProvider: CryptoProvider,
    private readonly jwtProvider: JwtProvider,
  ) {}

  async createUser(user: User) {
    const existingUser = await this.userRepository.findOneByEmail(user.email);
    if (existingUser) {
      throw new ConflictError('There is already a user with this email.');
    }
    const hashedPassword = await this.cryptoProvider.hashPassword(
      user.password,
    );
    await this.userRepository.create({
      email: user.email,
      password: hashedPassword,
    });
  }

  async authenticateUser(email: string, password: string) {
    const user = await this.userRepository.findOneByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    const passwordMatch = await this.cryptoProvider.comparePassword(
      password,
      user.password as string,
    );
    if (!passwordMatch) {
      throw new BadRequestError('Invalid email or password.');
    }

    const token = this.jwtProvider.sign({
      userId: user._id?.toString() || '',
      email: user.email,
    });

    return { user, token };
  }
}
