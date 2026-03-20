import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should return the user if valid', () => {
    const user = { id: 1, email: 'test@test.com' };
    const result = guard['handleRequest'](null, user);
    expect(result).toEqual(user);
  });

  it('should throw UnauthorizedException if no user', () => {
    expect(() => guard['handleRequest'](null, null)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if there is an error', () => {
    const error = new Error('JWT invalid');
    expect(() => guard['handleRequest'](error, { id: 1 })).toThrow(UnauthorizedException);
  });
});