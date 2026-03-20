import { EntryResponseDto } from "../dtos/entry.dto";
import { Entry } from "./entry.entity";

export const toEntryResponseDto = (entity: any): EntryResponseDto => ({
  id: entity.id,
  wordFrom: entity.wordFrom,
  languageFrom: entity.languageFrom,
  wordTo: entity.wordTo,
  languageTo: entity.languageTo,
  category: entity.category,
  notes: entity.notes,
  isFavorite: entity.isFavorite,
  dictionaryId: entity.dictionaryId,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,

});


