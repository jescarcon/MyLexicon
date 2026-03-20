import { Dictionary } from 'src/modules/dictionary/entities/dictionary.entity';
import { UserRole } from '../entities/user-role.enum';

export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  dictionaries?: Dictionary[];
  createdAt: Date;
  updatedAt: Date;
}