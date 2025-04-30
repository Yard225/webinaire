import { Entity } from "../../shared/entity";

type ParticipationProps = {
  userId: string;
  webinaireId: string;
};

export class Participation extends Entity<ParticipationProps> {}
