import { User } from '../../users/entities/user.entity';
import { Webinaire } from '../entities/webinaire.entity';
import { IDateGenerator } from '../../core/ports/fixed-date-generator.interface';
import { IIDGenerator } from '../../core/ports/fixed-id-generator.interface';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';
import { Executable } from '../../shared/executable';

type Request = {
  user: User;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

type Response = { id: string };

export class OrganizerWebinaire implements Executable<Request, Response> {
  constructor(
    private readonly repository: IWebinaireRepository,
    private readonly idGenerator: IIDGenerator,
    private readonly dateGenerator: IDateGenerator,
  ) {}

  async execute(data: Request) {
    const id = this.idGenerator.generate();
    const webinaire = new Webinaire({
      id,
      organizerId: data.user.props.id,
      title: data.title,
      seats: data.seats,
      startDate: data.startDate,
      endDate: data.endDate,
    });

    if (webinaire.itTooClose(this.dateGenerator.now())) {
      throw new Error(
        'Le webinaire doit être organiser 03 jours avant la date de début',
      );
    }

    if (webinaire.hasTooManySeats()) {
      throw new Error('La capacité du webinaire est de 1000 places');
    }

    if (webinaire.hasNoSeats()) {
      throw new Error(
        'Le nombre de place au webinaire soit être de minimum 1 place',
      );
    }

    this.repository.createWebinaire(webinaire);
    return { id };
  }
}
