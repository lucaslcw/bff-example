import { AuthMiddleware } from '../middlewares/auth.middleware';
import { JwtProvider } from '../provider/jwt.provider';

export function createAuthMiddleware(): AuthMiddleware {
  const jwtProvider = new JwtProvider();
  return new AuthMiddleware(jwtProvider);
}
