import { Module } from '@nestjs/common';

import { InMemoryWebinaireRepository } from '../webinaires/adapters/in-memory-webinaire.repository';
import { OrganizerWebinaire } from '../webinaires/usescases/organize-webinaire';
import { I_WEBINAIRE_REPOSITORY } from '../webinaires/ports/webinaire-repository.interface';
import { I_DATE_GENERATOR } from '../core/ports/fixed-date-generator.interface';
import { I_ID_GENERATOR } from '../core/ports/fixed-id-generator.interface';
import { WebinaireController } from './controllers/webinaire.controller';
import { CommonModule } from '../core/common.module';
import { ChangeSeats } from './usescases/change-seats';

@Module({
  imports: [CommonModule],
  controllers: [WebinaireController],
  providers: [
    {
      provide: I_WEBINAIRE_REPOSITORY,
      useFactory: () => {
        return new InMemoryWebinaireRepository();
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
  ],
  exports: [I_WEBINAIRE_REPOSITORY],
})
export class WebinaireModule {}
