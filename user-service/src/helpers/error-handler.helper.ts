import type { FastifyRequest, FastifyReply } from 'fastify';
import { AppError, ValidationError } from '../errors/app-error';

export class ErrorHandler {
  static handle(
    error: unknown,
    request: FastifyRequest,
    reply: FastifyReply,
  ): FastifyReply {
    if (error instanceof AppError) {
      const response: { error: string; code?: string; details?: unknown } = {
        error: error.message,
      };

      if (error.code) {
        response.code = error.code;
      }

      if (error instanceof ValidationError && error.details) {
        response.details = error.details;
      }

      return reply.status(error.statusCode).send(response);
    }

    request.log.error(error, 'Unexpected error');
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
