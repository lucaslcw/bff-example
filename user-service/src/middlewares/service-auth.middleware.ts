import { FastifyRequest, FastifyReply } from 'fastify';
import { ServiceTokenProvider } from '../provider/service-token.provider';

export class ServiceAuthMiddleware {
  constructor(private readonly serviceTokenProvider: ServiceTokenProvider) {}

  async authenticate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const xToken = request.headers['x-token'];

      if (!xToken) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'No service token provided',
        });
      }

      if (typeof xToken !== 'string') {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Invalid token format',
        });
      }

      const isValid = this.serviceTokenProvider.verify(xToken);

      if (!isValid) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Invalid service token',
        });
      }
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Authentication failed',
      });
    }
  }
}
