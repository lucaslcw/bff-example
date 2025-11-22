import type { Collection } from 'mongodb';
import { User } from '../domain/user.domain';

export class UserRepository {
  private collection: Collection;

  constructor(collection: Collection) {
    this.collection = collection;
  }

  async findOneByEmail(email: string) {
    return this.collection.findOne({ email });
  }

  async create(user: Partial<User>) {
    return this.collection.insertOne(user);
  }
}
