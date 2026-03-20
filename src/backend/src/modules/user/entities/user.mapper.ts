import { UserResponseDto } from "../dtos/user.dto";
import { User } from "./user.entity";

export const toUserResponseDto = (user: User): UserResponseDto => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    verified: user.verified,
    dictionaries: user.dictionaries,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};