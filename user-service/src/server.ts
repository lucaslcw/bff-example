import 'dotenv/config';
import Fastify from 'fastify';
import mongodb from '@fastify/mongodb';
import { envToLogger } from './config/logger';
import { DatabaseHelper } from './config/database';
import { UserControllerFactory } from './factories/user-controller.factory';
import { userRoutes } from './routes/user.routes';

const environment = (process.env.NODE_ENV ||
  'development') as keyof typeof envToLogger;

const fastify = Fastify({
  logger: envToLogger[environment] ?? true,
});

fastify.register(mongodb, {
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/user-service',
  forceClose: true,
});

fastify.register(async (instance) => {
  await instance.after();

  if (!instance.mongo?.db) {
    throw new Error('MongoDB connection failed - db is undefined');
  }

  await DatabaseHelper.verifyConnection(instance.mongo.db as any, instance.log);

  const userController = UserControllerFactory.create(instance.mongo.db as any);

  await instance.register(userRoutes, {
    prefix: '/users',
    userController,
  });

  instance.log.info('MongoDB initialized and ready');
});

fastify.listen(
  { port: Number(process.env.PORT) || 3000, host: '0.0.0.0' },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
  },
);
