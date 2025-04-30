import { Module } from "@nestjs/common";

import { I_USER_REPOSITORY } from "../users/ports/user-repository.interface";
import { CommonModule } from "../core/common.module";
import { InMemoryUserRepository } from "./adapters/in-memory-user.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoUser } from "./adapters/mongo/mongo-user";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MongoUser.CollectionName,
        schema: MongoUser.Schema,
      },
    ]),
    CommonModule,
  ],
  controllers: [],
  providers: [
    {
      provide: I_USER_REPOSITORY,
      useFactory: () => {
        return new InMemoryUserRepository();
      },
    },
  ],
  exports: [I_USER_REPOSITORY],
})
export class UserModule {}
