import { e2eUsers } from "./user-seeds.e2e";
import { ParticipationFixture } from "../fixtures/participation-fixture";
import { Participation } from "../../webinaires/entities/participation.entity";
import { e2eWebinaires } from "./webinaire-seed.e2e";

export const e2eParticipations = {
  participation1: new ParticipationFixture(
    new Participation({
      userId: e2eUsers.bob.entity.props.id,
      webinaireId: e2eWebinaires.webinaire1.entity.props.id,
    })
  ),
};
