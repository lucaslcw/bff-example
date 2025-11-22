import { createUserSchema, type CreateUserInputZod } from '../dto/user.dto';
import { ValidationError } from '../errors/app-error';

export class UserValidator {
  validateCreateUser(body: unknown): CreateUserInputZod {
    const result = createUserSchema.safeParse(body);
    if (!result.success) {
      const details = result.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Validation failed', details);
    }
    return result.data;
  }
}
