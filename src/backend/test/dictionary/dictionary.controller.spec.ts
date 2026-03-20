import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DictionaryService } from 'src/modules/dictionary/dictionary.service';
import { DictionaryController } from 'src/modules/dictionary/dictionary.controller';
import { UserRole } from 'src/modules/user/entities/user-role.enum';

describe('DictionaryController', () => {
  let controller: DictionaryController;
  let service: jest.Mocked<DictionaryService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const adminUser = { id: 1, role: UserRole.ADMIN };
  const normalUser = { id: 2, role: UserRole.USER };
  const mockDict = { id: 10, userId: 2, name: 'Test Dict' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DictionaryController],
      providers: [{ provide: DictionaryService, useValue: mockService }],
    }).compile();

    controller = module.get(DictionaryController);
    service = module.get(DictionaryService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = { name: 'En-Es', languageFrom: 'ENGLISH', languageTo: 'SPANISH' };

    it('should create a dictionary', async () => {
      service.create.mockResolvedValue(mockDict as any);
      const res = await controller.create({ user: normalUser }, dto);
      expect(res.createdDictionary).toEqual(mockDict);
    });

    it('should throw BadRequest on validation error', async () => {
      await expect(controller.create({ user: normalUser }, {})).rejects.toThrow(HttpException);
    });
  });

  describe('findAll (Admin)', () => {
    it('should allow admin to get all', async () => {
      service.findAll.mockResolvedValue([mockDict] as any);
      const res = await controller.findAll({ user: adminUser });
      expect(res.dictionaries).toHaveLength(1);
    });

    it('should forbid non-admin users', async () => {
      await expect(controller.findAll({ user: normalUser })).rejects.toThrow('Forbidden');
    });
  });

  describe('getAllMyDicts', () => {
    it('should return user dictionaries', async () => {
      service.findAll.mockResolvedValue([mockDict] as any);
      const res = await controller.getAllMyDicts({ user: normalUser });
      expect(service.findAll).toHaveBeenCalledWith(normalUser.id);
      expect(res.dictionaries).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should allow owner to see their dictionary', async () => {
      service.findOne.mockResolvedValue(mockDict as any);
      const res = await controller.findOne({ user: normalUser }, '10');
      expect(res.dictionary).toEqual(mockDict);
    });

    it('should allow admin to see any dictionary', async () => {
      service.findOne.mockResolvedValue(mockDict as any);
      const res = await controller.findOne({ user: adminUser }, '10');
      expect(res.dictionary).toBeDefined();
    });

    it('should forbid if user is not the owner', async () => {
      service.findOne.mockResolvedValue(mockDict as any);
      const otherUser = { id: 99, role: UserRole.USER };
      await expect(controller.findOne({ user: otherUser }, '10')).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Updated' };

    it('should update if owner', async () => {
      service.findOne.mockResolvedValue(mockDict as any);
      service.update.mockResolvedValue({ ...mockDict, ...updateDto } as any);
      const res = await controller.update({ user: normalUser }, '10', updateDto);
      expect(res.updatedDictionary.name).toBe('Updated');
    });

    it('should throw if validation fails', async () => {
      service.findOne.mockResolvedValue(mockDict as any);
      await expect(controller.update({ user: normalUser }, '10', { name: 123 })).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete if owner', async () => {
      service.findOne.mockResolvedValue(mockDict as any);
      service.remove.mockResolvedValue(mockDict as any);
      const res = await controller.remove({ user: normalUser }, '10');
      expect(res.message).toContain('deleted');
    });

    it('should throw if dictionary not found', async () => {
      service.findOne.mockRejectedValue(new Error('Not found'));
      await expect(controller.remove({ user: normalUser }, '999')).rejects.toThrow(HttpException);
    });
  });
});