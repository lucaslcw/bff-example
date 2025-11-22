import 'dotenv/config';
import Fastify from 'fastify';
import mongodb from '@fastify/mongodb';
import { envToLogger } from './config/logger';
import { DatabaseHelper } from './config/database';
import { UserControllerFactory } from './factories/user-controller.factory';
import { UserController } from './controllers/user.controller';
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

let userController: UserController;

fastify.addHook('onReady', async () => {
  try {
    if (!fastify.mongo?.db) {
      throw new Error('MongoDB connection failed - db is undefined');
    }

    await DatabaseHelper.verifyConnection(fastify.mongo.db as any, fastify.log);

    userController = UserControllerFactory.create(fastify.mongo.db as any);

    await fastify.register(userRoutes, {
      prefix: '/users',
      userController,
    });

    fastify.log.info('MongoDB initialized and ready');
  } catch (error) {
    fastify.log.error(
      { error, stack: error instanceof Error ? error.stack : undefined },
      'Failed to initialize MongoDB connection',
    );
    throw error;
  }
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
