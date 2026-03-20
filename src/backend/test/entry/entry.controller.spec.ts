import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from 'src/modules/user/entities/user-role.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DictionaryService } from 'src/modules/dictionary/dictionary.service';
import { EntryService } from 'src/modules/entry/entry.service';
import { EntryController } from 'src/modules/entry/entry.controller';

describe('EntryController', () => {
  let controller: EntryController;
  let entryService: jest.Mocked<EntryService>;
  let dictService: jest.Mocked<DictionaryService>;

  const mockUser = { id: 1, role: UserRole.USER };
  const mockDict = { id: 10, userId: 1 };
  const mockEntry = { id: 100, dictionaryId: 10, wordFrom: 'Hello' };
  // DTO que pasa la validación de Zod (asegúrate de que coincida con tu esquema)
  const validDto = { wordFrom: 'Hi', wordTo: 'Hola' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntryController],
      providers: [
        { provide: EntryService, useValue: { create: jest.fn(), findAllByDict: jest.fn(), findOne: jest.fn(), update: jest.fn(), remove: jest.fn() } },
        { provide: DictionaryService, useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    controller = module.get(EntryController);
    entryService = module.get(EntryService);
    dictService = module.get(DictionaryService);
  });

  describe('create', () => {
    it('should create successfully', async () => {
      dictService.findOne.mockResolvedValue(mockDict as any);
      entryService.create.mockResolvedValue(mockEntry as any);
      const res = await controller.create({ user: mockUser }, '10', validDto);
      expect(res.createdEntry).toBeDefined();
    });

    it('should re-throw if error has status (FORBIDDEN/NOT_FOUND)', async () => {
      // Forzamos que checkOwnership falle con un status
      dictService.findOne.mockRejectedValue({ status: HttpStatus.FORBIDDEN });
      await expect(controller.create({ user: mockUser }, '10', validDto))
        .rejects.toMatchObject({ status: HttpStatus.FORBIDDEN });
    });

    it('should throw BAD_REQUEST on validation or generic error', async () => {
      dictService.findOne.mockResolvedValue(mockDict as any);
      // Forzamos error genérico (sin status) para entrar al último throw
      entryService.create.mockRejectedValue(new Error('Zod or DB fail'));
      await expect(controller.create({ user: mockUser }, '10', validDto))
        .rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should re-throw if status is FORBIDDEN', async () => {
      dictService.findOne.mockRejectedValue({ status: HttpStatus.FORBIDDEN });
      await expect(controller.findAll({ user: mockUser }, '10'))
        .rejects.toMatchObject({ status: HttpStatus.FORBIDDEN });
    });

    it('should throw NOT_FOUND on other errors', async () => {
      dictService.findOne.mockRejectedValue(new Error());
      await expect(controller.findAll({ user: mockUser }, '10'))
        .rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should re-throw if FORBIDDEN', async () => {
      entryService.findOne.mockResolvedValue(mockEntry as any);
      dictService.findOne.mockRejectedValue({ status: HttpStatus.FORBIDDEN });
      await expect(controller.findOne({ user: mockUser }, '100'))
        .rejects.toMatchObject({ status: HttpStatus.FORBIDDEN });
    });

    it('should throw NOT_FOUND if entry service fails', async () => {
      entryService.findOne.mockRejectedValue(new Error());
      await expect(controller.findOne({ user: mockUser }, '100'))
        .rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should re-throw original status error', async () => {
      entryService.findOne.mockRejectedValue({ status: HttpStatus.NOT_FOUND });
      await expect(controller.update({ user: mockUser }, '100', validDto))
        .rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });

    it('should throw BAD_REQUEST on update failure', async () => {
      entryService.findOne.mockResolvedValue(mockEntry as any);
      dictService.findOne.mockResolvedValue(mockDict as any);
      entryService.update.mockRejectedValue(new Error());
      await expect(controller.update({ user: mockUser }, '100', validDto))
        .rejects.toThrow(HttpException);
    });
  });

  describe('remove', () => {
    it('should handle FORBIDDEN in remove', async () => {
      entryService.findOne.mockResolvedValue(mockEntry as any);
      dictService.findOne.mockRejectedValue({ status: HttpStatus.FORBIDDEN });
      await expect(controller.remove({ user: mockUser }, '100'))
        .rejects.toMatchObject({ status: HttpStatus.FORBIDDEN });
    });

    it('should handle general NOT_FOUND in remove', async () => {
      entryService.findOne.mockRejectedValue(new Error());
      await expect(controller.remove({ user: mockUser }, '100'))
        .rejects.toThrow(HttpException);
    });
  });
});