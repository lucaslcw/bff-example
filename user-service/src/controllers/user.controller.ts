import type { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';
import type {
  AuthenticateUserInputZod,
  CreateUserInputZod,
} from '../dto/user.dto';
import { User } from '../domain/user.domain';
import { ErrorHandler } from '../helpers/error-handler.helper';

export class UserController {
  constructor(private readonly userService: UserService) {}

  async createUser(
    request: FastifyRequest<{ Body: CreateUserInputZod }>,
    reply: FastifyReply,
  ) {
    try {
      const user = User.create(request.body);
      await this.userService.createUser(user);
      return reply.status(201).send();
    } catch (error) {
      return ErrorHandler.handle(error, request, reply);
    }
  }

  async authenticateUser(
    request: FastifyRequest<{ Body: AuthenticateUserInputZod }>,
    reply: FastifyReply,
  ) {
    try {
      const { email, password } = request.body;
      const result = await this.userService.authenticateUser(email, password);
      return reply.status(200).send(result);
    } catch (error) {
      return ErrorHandler.handle(error, request, reply);
    }
  }
}
