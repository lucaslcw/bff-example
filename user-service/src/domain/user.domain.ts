import type { ObjectId } from 'mongodb';
import { createUserSchema } from '../dto/user.dto';

export class User {
  private constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly _id?: ObjectId,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(data: { email: string; password: string }): User {
    const validation = createUserSchema.safeParse(data);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw new Error(firstError?.message || 'Validation error');
    }

    return new User(data.email, data.password);
  }

  static fromPersistence(data: {
    _id: ObjectId;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    return new User(
      data.email,
      data.password,
      data._id,
      data.createdAt,
      data.updatedAt,
    );
  }

  toPersistence(): {
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
  } {
    return {
      email: this.email,
      password: this.password,
      ...(this.createdAt && { createdAt: this.createdAt }),
      ...(this.updatedAt && { updatedAt: this.updatedAt }),
    };
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  hasStrongPassword(): boolean {
    return this.password.length >= 8;
  }
}
