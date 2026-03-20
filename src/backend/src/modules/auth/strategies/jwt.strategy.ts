import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET env variable missing');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    if (!payload?.sub || !payload?.email) {
      throw new UnauthorizedException({ message: 'Invalid token payload' });
    }
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role, 
      verified: payload.verified,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    };
  }
}
