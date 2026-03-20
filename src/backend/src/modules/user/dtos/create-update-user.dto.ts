import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "The name cannot be empty.")
    .max(50, "The name cannot exceed 50 characters."),

  email: z
    .email("Invalid email format.")
    .max(50, "The email cannot exceed 50 characters.")
    .nonempty("The email cannot be empty."),

  password: z
    .string()
    .min(6, "The password must be at least 6 characters long.")
    .max(255, "The password cannot exceed 255 characters.")
}).strict();

export type CreateUserDto = z.infer<typeof createUserSchema>;
export class CreateUserDtoClass extends createZodDto(createUserSchema) {} //Swagger 
//UPDATE DTO

export const updateUserSchema = createUserSchema
  .extend({ role: z.enum(['ADMIN', 'USER']).optional() })
  .partial();
  
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export class UpdateUserDtoClass extends createZodDto(updateUserSchema) {} //Swagger 
