import { User } from 'src/users/entities/user.entity';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';
import { Executable } from '../../shared/executable';

type Request = {
  user: User;
  webinaireId: string;
  seats: number;
};

type Response = void;

export class ChangeSeats implements Executable<Request, Response> {
  constructor(private readonly repository: IWebinaireRepository) {}

  async execute({ user, webinaireId, seats }): Promise<Response> {
    const webinaire = await this.repository.findById(webinaireId);

    if (!webinaire) {
      throw new Error('webinaire not found');
    }

    if (webinaire.props.organizerId !== user.props.id) {
      throw new Error('You are not allowed to update this webinaire');
    }

    if (seats < webinaire.props.seats) {
      throw new Error('You cannot reduce number of seats');
    }

    if (webinaire.hasNoSeats()) {
      throw new Error(
        'Le nombre de place au webinaire soit être de minimum 1 place',
      );
    }

    webinaire.update({ seats });

    if (webinaire.hasTooManySeats()) {
      throw new Error('The webinaire must have a maximum of 1000 seats');
    }

    await this.repository.update(webinaire);
  }
}
