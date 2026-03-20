import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserController } from 'src/modules/user/user.controller';
import { UserService } from 'src/modules/user/user.service';
import { UserRole } from 'src/modules/user/entities/user-role.enum';

describe('UserController', () => {
    let controller: UserController;
    let userService: jest.Mocked<UserService>;

    const mockUserService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    // ---------------- MOCK USERS ----------------
    const ADMIN = { id: 1, name: 'Admin', email: 'admin@test.com', role: UserRole.ADMIN, verified: true };
    const USER1 = { id: 2, name: 'User One', email: 'user1@test.com', role: UserRole.USER, verified: true };
    const USER2 = { id: 3, name: 'User Two', email: 'user2@test.com', role: UserRole.USER, verified: true };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [{ provide: UserService, useValue: mockUserService }],
        }).compile();

        controller = module.get<UserController>(UserController);
        userService = module.get(UserService);
        jest.clearAllMocks();
    });

    // ---------------- CREATE ----------------
    describe('create', () => {
        it('should create a new user', async () => {
            const createDto = { name: 'Test', email: 'test@test.com', password: 'Aa1@StrongPass' };
            mockUserService.create.mockResolvedValue({ ...createDto, id: 4, role: UserRole.USER, verified: false });

            const result = await controller.create(createDto);

            expect(result.message).toBe('User created successfully');
            expect(result.createdUser).toHaveProperty('id', 4);
            expect(userService.create).toHaveBeenCalledWith(expect.objectContaining(createDto));
        });

        it('should throw BAD_REQUEST for invalid body', async () => {
            await expect(controller.create({ invalid: true })).rejects.toBeInstanceOf(HttpException);
        });
    });

    // ---------------- FIND ALL ----------------
    describe('findAll', () => {
        it('ADMIN should fetch all users', async () => {
            const req = { user: ADMIN };
            mockUserService.findAll.mockResolvedValue([ADMIN, USER1, USER2]);

            const result = await controller.findAll(req);

            expect(result.users).toHaveLength(3);
            expect(userService.findAll).toHaveBeenCalled();
        });

        it('should throw FORBIDDEN if USER tries to fetch all', async () => {
            const req = { user: USER1 };
            await expect(controller.findAll(req)).rejects.toMatchObject({ status: HttpStatus.FORBIDDEN });
        });

        it('should throw INTERNAL_SERVER_ERROR on repo failure', async () => {
            const req = { user: ADMIN };
            mockUserService.findAll.mockRejectedValue(new Error('DB fail'));
            await expect(controller.findAll(req)).rejects.toMatchObject({ status: HttpStatus.INTERNAL_SERVER_ERROR });
        });
    });

    // ---------------- FIND ONE ----------------
    describe('findOne', () => {
        it('ADMIN should fetch any user', async () => {
            const req = { user: ADMIN };
            mockUserService.findOne.mockResolvedValue(USER1);

            const result = await controller.findOne(req, '2');

            expect(result.user).toEqual(USER1);
            expect(userService.findOne).toHaveBeenCalledWith(2);
        });

        it('USER should fetch self', async () => {
            const req = { user: USER1 };
            mockUserService.findOne.mockResolvedValue(USER1);

            const result = await controller.findOne(req, '2');

            expect(result.user).toEqual(USER1);
        });

        it('should throw FORBIDDEN if USER tries to fetch other user', async () => {
            const req = { user: USER1 };
            await expect(controller.findOne(req, '3')).rejects.toMatchObject({ status: HttpStatus.FORBIDDEN });
        });

        it('should throw NOT_FOUND if userService fails', async () => {
            const req = { user: ADMIN };
            mockUserService.findOne.mockRejectedValue(new Error('Not found'));
            await expect(controller.findOne(req, '2')).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
        });
    });

    // ---------------- UPDATE ----------------
    describe('update', () => {
        it('ADMIN can update any user', async () => {
            const req = { user: ADMIN };
            const body = { name: 'Updated' };
            mockUserService.update.mockResolvedValue({ ...USER1, ...body });

            const result = await controller.update(req, '2', body);

            expect(result.message).toBe('User updated successfully');
            expect(userService.update).toHaveBeenCalledWith(2, expect.objectContaining(body));
        });

        it('USER can update self', async () => {
            const req = { user: USER1 };
            const body = { name: 'SelfUpdate' };

            mockUserService.update.mockResolvedValue({ ...USER1, name: 'SelfUpdate' });

            const result = await controller.update(req, '2', body);

            expect(result.message).toBe('User updated successfully');
            expect(result.updatedUser.name).toBe('SelfUpdate');
        });

        it('should throw FORBIDDEN if USER updates another user', async () => {
            const req = { user: USER1 };
            await expect(controller.update(req, '3', {})).rejects.toMatchObject({ status: HttpStatus.FORBIDDEN });
        });

        it('should throw BAD_REQUEST for invalid body', async () => {
            const req = { user: ADMIN };
            await expect(controller.update(req, '2', { invalid: true })).rejects.toBeInstanceOf(HttpException);
        });
    });

    // ---------------- REMOVE ----------------
    describe('remove', () => {
        it('ADMIN can delete any user', async () => {
            const req = { user: ADMIN };
            mockUserService.findOne.mockResolvedValue(USER2);
            mockUserService.remove.mockResolvedValue(USER2);

            const result = await controller.remove(req, '3');

            expect(result.message).toBe('User deleted successfully');
            expect(userService.remove).toHaveBeenCalledWith(3);
        });

        it('USER can delete self', async () => {
            const req = { user: USER1 };
            mockUserService.findOne.mockResolvedValue(USER1);
            mockUserService.remove.mockResolvedValue(USER1);

            const result = await controller.remove(req, '2');

            expect(result.message).toBe('User deleted successfully');
        });

        it('should throw FORBIDDEN if USER deletes another', async () => {
            const req = { user: USER1 };
            await expect(controller.remove(req, '3')).rejects.toMatchObject({ status: HttpStatus.FORBIDDEN });
        });

        it('should throw NOT_FOUND if userService fails', async () => {
            const req = { user: ADMIN };
            mockUserService.findOne.mockRejectedValue(new Error('Not found'));
            await expect(controller.remove(req, '2')).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
        });
    });
});