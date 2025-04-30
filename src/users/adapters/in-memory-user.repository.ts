import { User } from "src/users/entities/user.entity";
import { IUserRepository } from "src/users/ports/user-repository.interface";

export class InMemoryUserRepository implements IUserRepository {
  constructor(public readonly database: User[] = []){};

  async create(user: User): Promise<void> {
    this.database.push(user);
  }

  async findbyEmailAddress(emailAddress: string): Promise<User | null> {
    const user = this.database.find(
      (user) => user.props.emailAddress === emailAddress
    );

    return user ?? null;
  }

  async findById(userId: string): Promise<User | null> {
    const user = this.database.find((u) => u.props.id === userId);

    return user ?? null;
  }
}
