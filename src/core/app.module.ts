import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Authenticator } from "../users/services/authenticator";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./auth.guard";
import { I_USER_REPOSITORY } from "../users/ports/user-repository.interface";
import { WebinaireModule } from "../webinaires/webinaire.module";
import { CommonModule } from "./common.module";
import { UserModule } from "../users/user.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    MongooseModule.forRootAsync ({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>("DATABASE_URL"),
      }),
    }),
    WebinaireModule,
    UserModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: Authenticator,
      inject: [I_USER_REPOSITORY],
      useFactory: (repository) => {
        return new Authenticator(repository);
      },
    },
    {
      provide: APP_GUARD,
      inject: [Authenticator],
      useFactory: (authenticator) => {
        return new AuthGuard(authenticator);
      },
    },
  ],
  exports: [],
})
export class AppModule {}
