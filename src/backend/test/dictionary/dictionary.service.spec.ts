import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DictionaryService } from 'src/modules/dictionary/dictionary.service';
import { Dictionary } from 'src/modules/dictionary/entities/dictionary.entity';
import { User } from 'src/modules/user/entities/user.entity';

describe('DictionaryService', () => {
  let service: DictionaryService;
  let repo: any;

  const mockDict = { id: 1, name: 'Dict', user: { id: 10 } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DictionaryService,
        {
          provide: getRepositoryToken(Dictionary),
          useValue: {
            create: jest.fn().mockReturnValue(mockDict),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        { provide: getRepositoryToken(User), useValue: {} }, // Solo se inyecta, no se usa
      ],
    }).compile();

    service = module.get(DictionaryService);
    repo = module.get(getRepositoryToken(Dictionary));
  });

  describe('create', () => {
    it('should create and return a dictionary', async () => {
      repo.save.mockResolvedValue(mockDict);
      repo.findOne.mockResolvedValue(mockDict); // findEntityById interno

      const result = await service.create(10, { name: 'Dict' } as any);
      expect(result.id).toBe(1);
      expect(repo.create).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      repo.save.mockRejectedValue(new Error());
      await expect(service.create(10, {} as any)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return all dictionaries if no userId is provided', async () => {
      repo.find.mockResolvedValue([mockDict]);
      const result = await service.findAll();
      expect(repo.find).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
      expect(result).toHaveLength(1);
    });

    it('should filter by userId if provided', async () => {
      repo.find.mockResolvedValue([mockDict]);
      await service.findAll(10);
      expect(repo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { user: { id: 10 } } }));
    });
  });

  describe('findOne', () => {
    it('should return dictionary if exists', async () => {
      repo.findOne.mockResolvedValue(mockDict);
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if not exists', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and save changes', async () => {
      repo.findOne.mockResolvedValue({ ...mockDict });
      repo.save.mockResolvedValue({ ...mockDict, name: 'New' });

      const result = await service.update(1, { name: 'New' });
      expect(result.name).toBe('New');
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete and return the deleted entity', async () => {
      repo.findOne.mockResolvedValue(mockDict);
      repo.remove.mockResolvedValue(mockDict);

      const result = await service.remove(1);
      expect(repo.remove).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it('should throw error if delete fails', async () => {
      repo.findOne.mockResolvedValue(mockDict);
      repo.remove.mockRejectedValue(new Error());
      await expect(service.remove(1)).rejects.toThrow(InternalServerErrorException);
    });
  });
});