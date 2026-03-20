import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Entry } from './entities/entry.entity';
import { Dictionary } from '../dictionary/entities/dictionary.entity';
import { CreateEntryDto, UpdateEntryDto } from './dtos/create-update-entry.dto';
import { EntryResponseDto } from './dtos/entry.dto';
import { toEntryResponseDto } from './entities/entry.mapper';

@Injectable()
export class EntryService {
  constructor(
    @InjectRepository(Entry) private readonly entryRepo: Repository<Entry>,
    @InjectRepository(Dictionary) private readonly dictRepo: Repository<Dictionary>,
  ) { }

  // Private method to get the full entity for internal operations
  private async findEntityById(id: number): Promise<Entry> {
    const entry = await this.entryRepo.findOne({ where: { id } });
    if (!entry) throw new NotFoundException(`Entry with ID ${id} not found`);
    return entry;
  }

  // Public method for the Controller to get a mapped DTO
  async findOne(id: number): Promise<EntryResponseDto> {
    const entry = await this.findEntityById(id);
    return toEntryResponseDto(entry);
  }

  // CREATE ENTRY
  async create(dictId: number, dto: CreateEntryDto): Promise<EntryResponseDto> {
    const dict = await this.dictRepo.findOne({ where: { id: dictId } });
    if (!dict) throw new NotFoundException('Target dictionary not found');

    try {
      const entryData: DeepPartial<Entry> = {
        ...dto,
        languageFrom: dict.languageFrom,
        languageTo: dict.languageTo,
        dictionaryId: dictId,
      };
      const entity = this.entryRepo.create(entryData);
      const saved = await this.entryRepo.save(entity);
      return toEntryResponseDto(saved);
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
  }

  // GET ALL BY DICTIONARY
  async findAllByDict(dictId: number): Promise<EntryResponseDto[]> {
    const entries = await this.entryRepo.find({
      where: { dictionaryId: dictId },
      order: { wordFrom: 'ASC' }
    });
    return entries.map(toEntryResponseDto);
  }

  // UPDATE
  async update(id: number, dto: UpdateEntryDto): Promise<EntryResponseDto> {
    const entry = await this.findEntityById(id);
    // Apply changes from dto to entity.
    Object.assign(entry, dto);
    const updated = await this.entryRepo.save(entry);
    return toEntryResponseDto(updated);
  }

  // DELETE 
  async remove(id: number): Promise<EntryResponseDto> {
    const entry = await this.findEntityById(id);
    await this.entryRepo.remove(entry);
    return toEntryResponseDto(entry);
  }
}