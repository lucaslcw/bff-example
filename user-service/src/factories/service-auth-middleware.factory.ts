import { ServiceAuthMiddleware } from '../middlewares/service-auth.middleware';
import { ServiceTokenProvider } from '../provider/service-token.provider';

export function createServiceAuthMiddleware(): ServiceAuthMiddleware {
  const serviceTokenProvider = new ServiceTokenProvider();
  return new ServiceAuthMiddleware(serviceTokenProvider);
}
