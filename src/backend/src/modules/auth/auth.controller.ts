import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginSchema, LoginDto, LoginDtoClass } from './dtos/login.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth - Public') //Swagger global tag
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiBody({ type: LoginDtoClass, description: 'Login credentials.' })
  @ApiOperation({ summary: 'Log in to get auth token.' })
  @ApiResponse({ status: 201, description: 'JWT token and details of the logged-in user are returned.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @Post('login')
  async login(@Body() body: unknown) {
    const dto: LoginDto = loginSchema.parse(body);
    return this.authService.login(dto);
  }

  @ApiBody({ schema: { type: 'object', properties: { token: { type: 'string' } }, required: ['token'] } })
  @ApiOperation({ summary: 'Verify auth token.' })
  @ApiResponse({ status: 201, description: 'Token is valid. Returns decoded token' })
  @ApiResponse({ status: 401, description: 'Token is invalid or expired.' })
  @Post('verify-token')
  async verify(@Body('token') token: string) {
    const decoded = await this.authService.verifyJwtToken(token);
    return { valid: true, decoded };
  }
}
