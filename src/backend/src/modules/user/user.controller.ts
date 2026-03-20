import { Controller, Get, Post, Patch, Delete, Body, Param, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import type { CreateUserDto, UpdateUserDto } from './dtos/create-update-user.dto';
import { CreateUserDtoClass, createUserSchema, UpdateUserDtoClass, updateUserSchema } from './dtos/create-update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from './entities/user-role.enum';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User - Public (Post) | Private Admin or Self (Get, Patch, Delete) ') //Swagger global tag
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  //#region CRUD

  // POST /users - PUBLIC
  @ApiBody({ type: CreateUserDtoClass, description: 'User creation payload.' })
  @ApiOperation({ summary: 'Register a new user (public).' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request body.' })
  @Post()
  async create(@Body() body: unknown) {
    try {
      const validated: CreateUserDto = createUserSchema.parse(body);
      const user = await this.userService.create(validated);
      return {
        message: 'User created successfully',
        createdUser: user,
      };
    } catch (err: any) {
      throw new HttpException(
        {
          message: 'Invalid request body',
          errors: err.errors || err.message,
          example: {
            name: 'Juan Pérez',
            email: 'juan.perez@example.com',
            password: 'Aa1@StrongPass',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET /users - PROTECTED (ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only).' })
  @ApiResponse({ status: 200, description: 'Users fetched successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid or missing JWT.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Access denied to fetch other users.' })
  @ApiResponse({ status: 500, description: 'Failed to fetch users.' })
  @Get()
  async findAll(@Req() req: any) {
    if (req.user.role !== UserRole.ADMIN)
      throw new HttpException('Forbidden: Access denied to fetch other users.', HttpStatus.FORBIDDEN);

    try {
      const users = await this.userService.findAll();
      return { message: 'Users fetched successfully', users };
    } catch (err: any) {
      throw new HttpException(
        { message: 'Failed to fetch users', errors: err.message ?? 'Unknown error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /users/:id - PROTECTED (admin or self)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single user by ID (Admin or self).' })
  @ApiResponse({ status: 200, description: 'User fetched successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid or missing JWT.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Access denied to fetch other users.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const userId = +id;
    if (req.user.role !== UserRole.ADMIN && req.user.id !== userId)
      throw new HttpException('Forbidden: Access denied to fetch other users.', HttpStatus.FORBIDDEN);

    try {
      const user = await this.userService.findOne(userId);
      return { message: 'User fetched successfully', user };
    } catch (err: any) {
      throw new HttpException(err.message || 'User not found', HttpStatus.NOT_FOUND);
    }
  }

  // PATCH /users/:id - PROTECTED (admin or self)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserDtoClass, description: 'User update payload.' })
  @ApiOperation({ summary: 'Update a user by ID (Admin or self).' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request body.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid or missing JWT.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Access denied to update other users.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: unknown) {
    const userId = +id;

    // Only Admins or Self
    if (req.user.role !== UserRole.ADMIN && req.user.id !== userId) {
      throw new HttpException(
        'Forbidden: Access denied to update other users.',
        HttpStatus.FORBIDDEN
      );
    }

    try {
      // Zod
      const validated: UpdateUserDto = updateUserSchema.parse(body);

      // Only admins updates role
      if ('role' in validated && req.user.role !== UserRole.ADMIN) {
        throw new HttpException(
          'Only admins can modify the role',
          HttpStatus.FORBIDDEN
        );
      }

      // update
      const updatedUser = await this.userService.update(userId, validated);

      return {
        message: 'User updated successfully',
        updatedUser,
      };
    } catch (err: any) {
      throw new HttpException(
        {
          message: 'Invalid request body',
          errors: err.errors || err.message,
          example: {
            name: 'Juan Pérez',
            email: 'juan.perez@example.com',
            password: 'Aa1@StrongPass',
          },
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  // DELETE /users/:id - PROTECTED (admin or self)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user by ID (Admin or self).' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid or missing JWT.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Access denied to delete other users.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const userId = +id;
    if (req.user.role !== UserRole.ADMIN && req.user.id !== userId)
      throw new HttpException('Forbidden: Access denied to delete other users.', HttpStatus.FORBIDDEN);

    try {
      const user = await this.userService.findOne(userId);
      await this.userService.remove(userId);
      return { message: 'User deleted successfully', deletedUser: user };
    } catch (err: any) {
      throw new HttpException(err.message || 'User not found', HttpStatus.NOT_FOUND);
    }
  }

  //#endregion

}