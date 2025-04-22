import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { RandomIDGenerator } from './adapters/random-id-generator';
import { CurrentDateGenerator } from './adapters/current-date-generator';
import { I_DATE_GENERATOR } from './ports/fixed-date-generator.interface';
import { I_ID_GENERATOR } from './ports/fixed-id-generator.interface';

@Module({
  imports: [],
  controllers: [],
  providers: [
    AppService,
    {
      provide: I_ID_GENERATOR,
      useClass: RandomIDGenerator,
    },
    {
      provide: I_DATE_GENERATOR,
      useClass: CurrentDateGenerator,
    },
  ],
  exports: [I_DATE_GENERATOR, I_ID_GENERATOR],
})
export class CommonModule {}
