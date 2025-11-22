import type { Db } from 'mongodb';
import type { FastifyInstance } from 'fastify';

export interface DatabaseConfig {
  maxRetries?: number;
  retryDelay?: number;
}

export class DatabaseHelper {
  static async verifyConnection(
    db: Db,
    logger: FastifyInstance['log'],
    config: DatabaseConfig = {},
  ): Promise<void> {
    const { maxRetries = 5, retryDelay = 1000 } = config;
    let retries = maxRetries;

    while (retries > 0) {
      try {
        await db.listCollections().toArray();
        logger.info('MongoDB connection verified');
        return;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        logger.warn(
          `MongoDB connection test failed, retrying... (${retries} left)`,
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }
}
