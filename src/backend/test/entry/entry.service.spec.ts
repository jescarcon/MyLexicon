import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Entry } from 'src/modules/entry/entities/entry.entity';
import { EntryService } from 'src/modules/entry/entry.service';
import { Dictionary } from 'src/modules/dictionary/entities/dictionary.entity';

describe('EntryService', () => {
  let service: EntryService;
  let entryRepo: any;
  let dictRepo: any;

  const mockDict = { id: 10, languageFrom: 'en', languageTo: 'es' };
  const mockEntry = { id: 100, dictionaryId: 10, wordFrom: 'Hello', wordTo: 'Hola' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntryService,
        {
          provide: getRepositoryToken(Entry),
          useValue: {
            create: jest.fn().mockReturnValue(mockEntry),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Dictionary),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(EntryService);
    entryRepo = module.get(getRepositoryToken(Entry));
    dictRepo = module.get(getRepositoryToken(Dictionary));
  });

  describe('create', () => {
    const dto = { wordFrom: 'Hi', wordTo: 'Hola' };

    it('should create an entry successfully', async () => {
      dictRepo.findOne.mockResolvedValue(mockDict);
      entryRepo.save.mockResolvedValue(mockEntry);

      const result = await service.create(10, dto as any);
      
      expect(result.id).toBe(mockEntry.id);
      expect(entryRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        languageFrom: mockDict.languageFrom,
        dictionaryId: 10
      }));
    });

    it('should throw NotFound if dictionary does not exist', async () => {
      dictRepo.findOne.mockResolvedValue(null);
      await expect(service.create(999, dto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerError if save fails', async () => {
      dictRepo.findOne.mockResolvedValue(mockDict);
      entryRepo.save.mockRejectedValue(new Error('DB Error'));
      await expect(service.create(10, dto as any)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return entry if found', async () => {
      entryRepo.findOne.mockResolvedValue(mockEntry);
      const result = await service.findOne(100);
      expect(result.id).toBe(100);
    });

    it('should throw NotFound if entry not found', async () => {
      entryRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(100)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByDict', () => {
    it('should return all entries for a dictionary', async () => {
      entryRepo.find.mockResolvedValue([mockEntry]);
      const result = await service.findAllByDict(10);
      expect(result).toHaveLength(1);
      expect(entryRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { dictionaryId: 10 } }));
    });
  });

  describe('update', () => {
    it('should update and save entry', async () => {
      entryRepo.findOne.mockResolvedValue({ ...mockEntry });
      entryRepo.save.mockResolvedValue({ ...mockEntry, wordFrom: 'Updated' });

      const result = await service.update(100, { wordFrom: 'Updated' });
      expect(result.wordFrom).toBe('Updated');
      expect(entryRepo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove the entry if found', async () => {
      entryRepo.findOne.mockResolvedValue(mockEntry);
      entryRepo.remove.mockResolvedValue(mockEntry);

      const result = await service.remove(100);
      expect(entryRepo.remove).toHaveBeenCalled();
      expect(result.id).toBe(100);
    });
  });
});