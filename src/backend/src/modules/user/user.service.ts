import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import type { CreateUserDto, UpdateUserDto } from './dtos/create-update-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from './entities/user-role.enum';
import { UserResponseDto } from './dtos/user.dto';
import { toUserResponseDto } from './entities/user.mapper';

@Injectable()
export class UserService {
  private readonly saltRounds: number;

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,

    private readonly configService: ConfigService,
  ) {
    this.saltRounds = Number(this.configService.get<number>('BCRYPT_SALT')) || 10;
  }

  //#region PRIVATE ENTITY METHOD

  private async findEntityById(id: number): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  //#endregion

  //#region CRUD

  // CREATE USER
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already exists');

    try {
      const user: DeepPartial<User> = {
        name: dto.name,
        email: dto.email,
        password: await bcrypt.hash(dto.password, this.saltRounds),
        role: UserRole.USER, 
        verified: false,
      };

      const userEntity = this.usersRepo.create(user);
      const savedUser = await this.usersRepo.save(userEntity);
      return toUserResponseDto(savedUser);
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
  }

  // GET ALL USERS
  async findAll(): Promise<UserResponseDto[]> {
    try {
      const users = await this.usersRepo.find();
      return users.map(toUserResponseDto);
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
  }

  // GET ONE USER
  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.findEntityById(id);
    return toUserResponseDto(user);
  }

  // UPDATE USER
  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findEntityById(id);

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.password !== undefined) {
      user.password = await bcrypt.hash(dto.password, this.saltRounds);
    }
    if (dto.role !== undefined) {
      user.role = UserRole[dto.role as keyof typeof UserRole];
    }

    const updated = await this.usersRepo.save(user);
    return toUserResponseDto(updated);
  }

  // DELETE USER
  async remove(id: number): Promise<UserResponseDto> {
    const user = await this.findEntityById(id);

    await this.usersRepo.remove(user);

    return toUserResponseDto(user);
  }

  //#endregion

  //#region CUSTOM

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepo.findOne({ where: { email } });
  }

  //#endregion
}