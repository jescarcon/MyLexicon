import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/modules/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/modules/user/entities/user-role.enum';
import { UserResponseDto } from 'src/modules/user/dtos/user.dto';
import { toUserResponseDto } from 'src/modules/user/entities/user.mapper';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

jest.mock('bcrypt');

describe('UserService', () => {
    let service: UserService;
    let repo: jest.Mocked<Repository<User>>;
    let configService: jest.Mocked<ConfigService>;

    const mockUser: User = {
        id: 1,
        name: 'Admin',
        email: 'admin@test.com',
        password: 'hashedpass',
        role: UserRole.ADMIN,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockRepo = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
    };

    const mockConfig = {
        get: jest.fn().mockReturnValue(10),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: getRepositoryToken(User), useValue: mockRepo },
                { provide: ConfigService, useValue: mockConfig },
            ],
        }).compile();

        service = module.get(UserService);
        repo = module.get(getRepositoryToken(User));
        configService = module.get(ConfigService);

        jest.clearAllMocks();
    });

    // ---------------- CREATE ----------------
    describe('create', () => {
        it('should create a new user', async () => {
            const dto = { name: 'Test', email: 'test@test.com', password: 'Password1!' };
            repo.findOne.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            repo.create.mockReturnValue(mockUser);
            repo.save.mockResolvedValue(mockUser);

            const result = await service.create(dto);

            expect(repo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
            expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
            expect(result).toEqual(toUserResponseDto(mockUser));
        });

        it('should throw BadRequestException if email exists', async () => {
            const dto = { name: 'Test', email: 'admin@test.com', password: 'Password1!' };

            mockRepo.findOne.mockResolvedValueOnce(mockUser);

            await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);

            expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
        });

        it('should throw InternalServerErrorException on repo failure', async () => {
            const dto = { name: 'Test', email: 'new@test.com', password: 'Password1!' };
            repo.findOne.mockResolvedValue(null);
            repo.create.mockImplementation(() => { throw new Error('DB fail'); });

            await expect(service.create(dto)).rejects.toBeInstanceOf(InternalServerErrorException);
        });
    });

    // ---------------- FIND ALL ----------------
    describe('findAll', () => {
        it('should return all users', async () => {
            repo.find.mockResolvedValue([mockUser]);
            const result = await service.findAll();
            expect(result).toEqual([toUserResponseDto(mockUser)]);
            expect(repo.find).toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException on repo failure', async () => {
            repo.find.mockRejectedValue(new Error('DB fail'));
            await expect(service.findAll()).rejects.toBeInstanceOf(InternalServerErrorException);
        });
    });

    // ---------------- FIND ONE ----------------
    describe('findOne', () => {
        it('should return a user by ID', async () => {
            repo.findOne.mockResolvedValue(mockUser);
            const result = await service.findOne(1);
            expect(result).toEqual(toUserResponseDto(mockUser));
        });

        it('should throw NotFoundException if user not found', async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    // ---------------- UPDATE ----------------
    describe('update', () => {
        it('should update a user', async () => {
            const dto = { name: 'Updated', password: 'NewPass1!' };
            repo.findOne.mockResolvedValue(mockUser);
            (bcrypt.hash as jest.Mock).mockResolvedValue('newHashed');
            repo.save.mockResolvedValue({ ...mockUser, ...dto });

            const result = await service.update(1, dto);

            expect(repo.save).toHaveBeenCalled();
            expect(result.name).toBe('Updated');
        });

        it('should throw NotFoundException if user not found', async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.update(1, { name: 'Test' })).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    // ---------------- REMOVE ----------------
    describe('remove', () => {
        it('should remove a user', async () => {
            repo.findOne.mockResolvedValue(mockUser);
            repo.remove.mockResolvedValue(mockUser);

            const result = await service.remove(1);
            expect(repo.remove).toHaveBeenCalledWith(mockUser);
            expect(result).toEqual(toUserResponseDto(mockUser));
        });

        it('should throw NotFoundException if user not found', async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.remove(1)).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    // ---------------- FIND BY EMAIL ----------------
    describe('findByEmail', () => {
        it('should return user if found', async () => {
            repo.findOne.mockResolvedValue(mockUser);
            const result = await service.findByEmail('admin@test.com');
            expect(result).toEqual(mockUser);
        });

        it('should return null if not found', async () => {
            repo.findOne.mockResolvedValue(null);
            const result = await service.findByEmail('unknown@test.com');
            expect(result).toBeNull();
        });
    });
});