import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';
import { IDateGenerator } from 'src/core/ports/fixed-date-generator.interface';

type Request = {
  user: User;
  webinaireId: string;
  startDate: Date;
  endDate: Date;
};

type Response = void;

export class ChangeDates implements Executable<Request, Response> {
  constructor(
    private readonly repository: IWebinaireRepository,
    private readonly dateGenerator: IDateGenerator,
  ) {}

  async execute(request: Request): Promise<Response> {
    const webinaire = await this.repository.findById(request.webinaireId);

    if (!webinaire) {
      throw new Error('Webinaire not found');
    }

    if (webinaire.props.organizerId !== request.user.props.id) {
      throw new Error('You are not allowed to update this webinaire');
    }

    if (webinaire.itTooClose(this.dateGenerator.now())) {
      throw new Error('The webinaire must happen in at least 3 days');
    }

    webinaire.update({
      startDate: request.startDate,
      endDate: request.endDate,
    });

    await this.repository.update(webinaire);
  }
}
