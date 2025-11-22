import type { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';
import type { CreateUserInputZod } from '../dto/user.dto';
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
      const result = await this.userService.createUser(user);
      return reply.status(201).send({
        id: result.insertedId?.toString(),
        email: user.email,
      });
    } catch (error) {
      return ErrorHandler.handle(error, request, reply);
    }
  }
}
