import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import type { UserController } from '../controllers/user.controller';
import type {
  AuthenticateUserInputZod,
  CreateUserInputZod,
} from '../dto/user.dto';

export async function userRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions & { userController: UserController },
) {
  const { userController } = options;

  fastify.post<{ Body: CreateUserInputZod }>(
    '/create',
    async function (request, reply) {
      return userController.createUser(request, reply);
    },
  );

  fastify.post<{ Body: AuthenticateUserInputZod }>(
    '/authenticate',
    async function (request, reply) {
      return userController.authenticateUser(request, reply);
    },
  );
}
