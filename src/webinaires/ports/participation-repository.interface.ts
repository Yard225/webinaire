import { Participation } from "../entities/participation.entity";

export const I_PARTICIPATION_REPOSITORY = "I_PARTICIPATION_REPOSITORY";

export interface IParticipationRepository {
  create(participation: Participation): Promise<void>;
  findOne(userId: string, webinaireId: string): Promise<Participation | null>;
  findByWebinaireId(webinaireId: string): Promise<Participation[]>;
  findParticipationCount(webinaireId: string): Promise<number>;
  delete(participation: Participation): Promise<void>;
}
