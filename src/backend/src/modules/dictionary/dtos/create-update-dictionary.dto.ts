import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Language } from '../entities/Language.enum'; // Asegúrate de que la ruta sea correcta

export const createDictionarySchema = z.object({
  name: z
    .string()
    .min(1, "The name cannot be empty.")
    .max(100, "The name cannot exceed 100 characters.")
    .optional(), 

  description: z
    .string()
    .max(255, "The description cannot exceed 255 characters.")
    .optional(),

  languageFrom: z.enum(Language,"The language has to be one of the allowed ones."),

  languageTo: z.enum(Language,"The language has to be one of the allowed ones."),

})
.strict();

export type CreateDictionaryDto = z.infer<typeof createDictionarySchema>;
export class CreateDictionaryDtoClass extends createZodDto(createDictionarySchema) {}

// UPDATE DTO

export const updateDictionarySchema = createDictionarySchema.partial();

export type UpdateDictionaryDto = z.infer<typeof updateDictionarySchema>;
export class UpdateDictionaryDtoClass extends createZodDto(updateDictionarySchema) {}