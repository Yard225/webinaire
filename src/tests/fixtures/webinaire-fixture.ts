import {
  I_WEBINAIRE_REPOSITORY,
  IWebinaireRepository,
} from '../../webinaires/ports/webinaire-repository.interface';
import { IFixture } from '../utils/fixtures.interface';
import { TestApp } from '../utils/test-app';
import { Webinaire } from 'src/webinaires/entities/webinaire.entity';

export class WebinaireFixtures implements IFixture {
  constructor(public entity: Webinaire) {}

  async load(app: TestApp): Promise<void> {
    const webinaireRepository = app.get<IWebinaireRepository>(
      I_WEBINAIRE_REPOSITORY,
    );
    await webinaireRepository.createWebinaire(this.entity);
  }
}
