import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtProvider } from '../provider/jwt.provider';
import { JwtPayload } from '../provider/jwt.provider';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export class AuthMiddleware {
  constructor(private readonly jwtProvider: JwtProvider) {}

  async authenticate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'No token provided',
        });
      }

      const parts = authHeader.split(' ');

      if (parts.length !== 2) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Invalid token format',
        });
      }

      const [scheme, token] = parts;

      if (!/^Bearer$/i.test(scheme)) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Token must be Bearer type',
        });
      }

      try {
        const decoded = this.jwtProvider.verify(token);
        request.user = decoded;
      } catch (error) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Invalid or expired token',
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
