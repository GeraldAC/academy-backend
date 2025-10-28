// backend/src/modules/users/mappers/user.mapper.ts
import { User } from '@prisma/client';

export class UserMapper {
  static toResponse(user: User) {
    const { passwordHash, ...withoutPassword } = user;

    return {
      ...withoutPassword,
      fullName: `${user.firstName} ${user.lastName}`
    };
  }

  static toResponseList(users: User[]) {
    return users.map(this.toResponse);
  }
}

