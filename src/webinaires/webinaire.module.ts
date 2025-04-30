import { Module } from "@nestjs/common";

import { InMemoryWebinaireRepository } from "../webinaires/adapters/in-memory-webinaire.repository";
import { OrganizerWebinaire } from "../webinaires/usescases/organize-webinaire";
import { I_WEBINAIRE_REPOSITORY } from "../webinaires/ports/webinaire-repository.interface";
import { I_DATE_GENERATOR } from "../core/ports/fixed-date-generator.interface";
import { I_ID_GENERATOR } from "../core/ports/fixed-id-generator.interface";
import { WebinaireController } from "./controllers/webinaire.controller";
import { CommonModule } from "../core/common.module";
import { ChangeSeats } from "./usescases/change-seats";
import { ChangeDates } from "./usescases/change-dates";
import { I_PARTICIPATION_REPOSITORY } from "./ports/participation-repository.interface";
import { I_MAILER } from "../core/ports/mailer.interface";
import { InMemoryParticipationRepository } from "./adapters/in-memory-participation.repository";
import { UserModule } from "../users/user.module";
import { CancelWebinaire } from "./usescases/cancel-webinaire";
import { ReserveSeat } from "./usescases/reserve-seat";
import { I_USER_REPOSITORY } from "../users/ports/user-repository.interface";
import { ParticipationController } from "./controllers/participation.controller";
import { CancelSeat } from "./usescases/cancel-seat";

@Module({
  imports: [CommonModule, UserModule],
  controllers: [WebinaireController, ParticipationController],
  providers: [
    {
      provide: I_WEBINAIRE_REPOSITORY,
      useFactory: () => {
        return new InMemoryWebinaireRepository();
      },
    },
    {
      provide: I_PARTICIPATION_REPOSITORY,
      useFactory: () => {
        return new InMemoryParticipationRepository();
      },
    },
    {
      provide: OrganizerWebinaire,
      inject: [I_WEBINAIRE_REPOSITORY, I_ID_GENERATOR, I_DATE_GENERATOR],
      useFactory: (repository, idGenerator, dateGenerator) => {
        return new OrganizerWebinaire(repository, idGenerator, dateGenerator);
      },
    },
    {
      provide: ChangeSeats,
      inject: [I_WEBINAIRE_REPOSITORY],
      useFactory: (repository) => {
        return new ChangeSeats(repository);
      },
    },
    {
      provide: ChangeDates,
      inject: [
        I_WEBINAIRE_REPOSITORY,
        I_DATE_GENERATOR,
        I_PARTICIPATION_REPOSITORY,
        I_MAILER,
      ],
      useFactory: (
        webinaireRepository,
        dateGenerator,
        participationRepository,
        usersRepository,
        mailer
      ) => {
        return new ChangeDates(
          webinaireRepository,
          dateGenerator,
          participationRepository,
          usersRepository,
          mailer
        );
      },
    },
    {
      provide: CancelWebinaire,
      inject: [I_WEBINAIRE_REPOSITORY, I_PARTICIPATION_REPOSITORY, I_MAILER],
      useFactory: (
        webinaireRepository,
        participationRepository,
        usersRepository,
        mailer
      ) => {
        return new CancelWebinaire(
          webinaireRepository,
          usersRepository,
          participationRepository,
          mailer
        );
      },
    },
    {
      provide: ReserveSeat,
      inject: [
        I_PARTICIPATION_REPOSITORY,
        I_MAILER,
        I_WEBINAIRE_REPOSITORY,
        I_USER_REPOSITORY,
      ],
      useFactory: (
        participationRepository,
        mailer,
        webinaireRepository,
        usersRepository
      ) => {
        return new ReserveSeat(
          participationRepository,
          mailer,
          webinaireRepository,
          usersRepository
        );
      },
    },
    {
      provide: CancelSeat,
      inject: [
        I_WEBINAIRE_REPOSITORY,
        I_PARTICIPATION_REPOSITORY,
        I_USER_REPOSITORY,
        I_MAILER,
      ],
      useFactory: (
        webinaireRepository,
        participationRepository,
        usersRepository,
        mailer
      ) => {
        return new CancelSeat(
          webinaireRepository,
          participationRepository,
          usersRepository,
          mailer
        );
      },
    },
  ],
  exports: [I_WEBINAIRE_REPOSITORY],
})
export class WebinaireModule {}
