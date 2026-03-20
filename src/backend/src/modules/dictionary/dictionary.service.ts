import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Dictionary } from './entities/dictionary.entity';
import { User } from '../user/entities/user.entity';
import { DictionaryResponseDto } from './dtos/dictionary.dto';
import { toDictionaryResponseDto } from './entities/dictionary.mapper';
import { CreateDictionaryDto, UpdateDictionaryDto } from './dtos/create-update-dictionary.dto';

@Injectable()
export class DictionaryService {
  constructor(
    @InjectRepository(Dictionary)
    private readonly dictionaryRepo: Repository<Dictionary>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // #region PRIVATE ENTITY METHOD

  private async findEntityById(id: number): Promise<Dictionary> {
    // Load user relation to allow ownership checks in the controller
    const dictionary = await this.dictionaryRepo.findOne({ 
      where: { id },
      relations: ['user'] 
    });

    if (!dictionary) throw new NotFoundException('Dictionary not found');
    return dictionary;
  }

  // #endregion

  // #region CRUD

  // CREATE DICTIONARY
  async create(userId: number, dto: CreateDictionaryDto): Promise<DictionaryResponseDto> {
    try {
      const dictionaryData: DeepPartial<Dictionary> = {
        name: dto.name,
        description: dto.description,
        languageFrom: dto.languageFrom,
        languageTo: dto.languageTo,
        user: { id: userId } as User, // Link to the authenticated user
      };

      const dictionaryEntity = this.dictionaryRepo.create(dictionaryData);
      const savedDictionary = await this.dictionaryRepo.save(dictionaryEntity);
      
      // Fetch to ensure relations are loaded for the mapper
      const fullDictionary = await this.findEntityById(savedDictionary.id);
      return toDictionaryResponseDto(fullDictionary);
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
  }

  // GET ALL OR USER DICTIONARIES
  async findAll(userId?: number): Promise<DictionaryResponseDto[]> {
    try {
      // If userId is undefined (Admin), fetch all. Otherwise filter by user.
      const dictionaries = await this.dictionaryRepo.find({
        where: userId ? { user: { id: userId } } : {},
        relations: ['user'],
        order: { createdAt: 'DESC' }
      });
      return dictionaries.map(toDictionaryResponseDto);
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
  }

  // GET ONE DICTIONARY
  async findOne(id: number): Promise<DictionaryResponseDto> {
    const dictionary = await this.findEntityById(id);
    return toDictionaryResponseDto(dictionary);
  }

  // UPDATE DICTIONARY
  async update(id: number, dto: UpdateDictionaryDto): Promise<DictionaryResponseDto> {
    const dictionary = await this.findEntityById(id);

    // Update only provided fields
    if (dto.name !== undefined) dictionary.name = dto.name;
    if (dto.description !== undefined) dictionary.description = dto.description;
    if (dto.languageFrom !== undefined) dictionary.languageFrom = dto.languageFrom;
    if (dto.languageTo !== undefined) dictionary.languageTo = dto.languageTo;

    try {
      const updated = await this.dictionaryRepo.save(dictionary);
      return toDictionaryResponseDto(updated);
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
  }

  // DELETE DICTIONARY
  async remove(id: number): Promise<DictionaryResponseDto> {
    const dictionary = await this.findEntityById(id);

    try {
      await this.dictionaryRepo.remove(dictionary);
      return toDictionaryResponseDto(dictionary);
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
  }

  // #endregion
}