import { User } from 'src/users/entities/user.entity';

export const I_USER_REPOSITORY = 'I_USER_REPOSITORY';
export interface IUserRepository {
  findbyEmailAddress(emailAddress: string): Promise<User | null>;
  create(user: User): Promise<void>;
}
