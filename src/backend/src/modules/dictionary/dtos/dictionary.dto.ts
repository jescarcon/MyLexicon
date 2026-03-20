import { User } from "src/modules/user/entities/user.entity";
import { Language } from "../entities/Language.enum";

export class DictionaryResponseDto {

  id: number;
  name?: string;
  description?: string;
  languageFrom: Language;
  languageTo: Language;
  userId: number;

  createdAt: Date;
  updatedAt: Date;
}

