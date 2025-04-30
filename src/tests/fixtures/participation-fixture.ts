import { Participation } from "../../webinaires/entities/participation.entity";
import { IFixture } from "../utils/fixtures.interface";
import { TestApp } from "../utils/test-app";
import {
  IParticipationRepository,
  I_PARTICIPATION_REPOSITORY,
} from "../../webinaires/ports/participation-repository.interface";

export class ParticipationFixture implements IFixture {
  constructor(public entity: Participation) {}

  async load(app: TestApp): Promise<void> {
    const participationRepository = app.get<IParticipationRepository>(
      I_PARTICIPATION_REPOSITORY
    );
    await participationRepository.create(this.entity);
  }
}
