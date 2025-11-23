import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
}

export class JwtProvider {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    if (!process.env.JWT_EXPIRES_IN) {
      throw new Error('JWT_EXPIRES_IN environment variable is required');
    }
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES_IN;
  }

  sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as any,
    });
  }

  verify(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
