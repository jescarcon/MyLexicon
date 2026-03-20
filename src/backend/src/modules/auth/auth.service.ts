import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildToken(user);
  }

  async verifyJwtToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token is invalid or expired');
    }
  }

  private buildToken(user: any) {
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') ?? '1d';
    const token = this.jwtService.sign(payload, { expiresIn: expiresIn as any });

    return {
      access_token: token,
      user: { id: user.id, name: user.name, email: user.email, verified: user.verified, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt, }
    };
  }

}
