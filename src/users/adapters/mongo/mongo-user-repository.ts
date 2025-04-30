import { Model } from "mongoose";
import { User } from "../../../users/entities/user.entity";
import { IUserRepository } from "../../../users/ports/user-repository.interface";
import { MongoUser } from "./mongo-user";

export class MongoUserRepository implements IUserRepository {
  constructor(private readonly model: Model<MongoUser.SchemaClass>) {}

  async findById(userId: string): Promise<User | null> {
    throw new Error("Method not implemented");
  }

  async findbyEmailAddress(emailAddress: string): Promise<User | null> {
    const user = await this.model.findOne({ emailAdress: emailAddress });
    return new User({
      id: user!._id,
      emailAddress: user!.emailAdress,
      password: user!.password,
    });
  }

  async create(user: User): Promise<void> {
    throw new Error("Method not implemented");
  }
}
