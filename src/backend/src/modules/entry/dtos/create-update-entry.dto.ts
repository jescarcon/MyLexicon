import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const entryBaseSchema = z.object({
  wordFrom: z.string().min(1, "Original word is required").max(100),
  wordTo: z.string().min(1, "Translation is required").max(100),
  category: z.string().max(50).optional().default('General'),
  notes: z.string().max(500).optional(),
  isFavorite: z.boolean().optional().default(false),
}).strict();

export const createEntrySchema = entryBaseSchema;
export type CreateEntryDto = z.infer<typeof createEntrySchema>;
export class CreateEntryDtoClass extends createZodDto(createEntrySchema) {}

export const updateEntrySchema = entryBaseSchema.partial();
export type UpdateEntryDto = z.infer<typeof updateEntrySchema>;
export class UpdateEntryDtoClass extends createZodDto(updateEntrySchema) {}