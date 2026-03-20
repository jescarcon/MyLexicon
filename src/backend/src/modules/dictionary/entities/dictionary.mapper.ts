import { DictionaryResponseDto } from "../dtos/dictionary.dto";
import { Dictionary } from "./dictionary.entity";

export const toDictionaryResponseDto = (dictionary: Dictionary): DictionaryResponseDto => {
  return {
    id: dictionary.id,
    name: dictionary.name,
    description: dictionary.description,
    languageFrom: dictionary.languageFrom,
    languageTo: dictionary.languageTo,
    userId: dictionary.user?.id,
    createdAt: dictionary.createdAt,
    updatedAt: dictionary.updatedAt,
  };
};


