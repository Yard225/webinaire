import { Participation } from "../entities/participation.entity";
import { IParticipationRepository } from "../ports/participation-repository.interface";

export class InMemoryParticipationRepository
  implements IParticipationRepository
{
  constructor(public database: Participation[] = []) {}

  async create(participation: Participation): Promise<void> {
    this.database.push(participation);
  }

  async findOne(
    userId: string,
    webinaireId: string
  ): Promise<Participation | null> {
    return this.findOneSync(userId, webinaireId);
  }

  findOneSync(userId: string, webinaireId: string): Participation | null {
    const retrievedParticipation = this.database.find(
      (p) => p.props.userId === userId && p.props.webinaireId === webinaireId
    );
    return retrievedParticipation ?? null;
  }

  async findByWebinaireId(webinaireId: string): Promise<Participation[]> {
    return this.database.filter((p) => p.props.webinaireId === webinaireId);
  }

  async findParticipationCount(webinaireId: string): Promise<number> {
    return this.database.reduce((count, participation) => {
      return participation.props.webinaireId === webinaireId
        ? count + 1
        : count;
    }, 0);
  }

  async delete(participation: Participation): Promise<void> {
    const index = this.database.findIndex(
      (p) =>
        p.props.userId === participation.props.userId &&
        p.props.webinaireId === participation.props.webinaireId
    );

    this.database.splice(index, 1);
  }
}
