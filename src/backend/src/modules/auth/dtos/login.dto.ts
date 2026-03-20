import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .email("Invalid email format")
    .max(50, "The email cannot exceed 50 characters"),
  password: z.string().min(1, "The password cannot be empty"),
}).strict();

export type LoginDto = z.infer<typeof loginSchema>;

export class LoginDtoClass extends createZodDto(loginSchema) {} //Swagger 