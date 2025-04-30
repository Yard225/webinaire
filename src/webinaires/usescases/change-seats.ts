import { User } from "../../users/entities/user.entity";
import { IWebinaireRepository } from "../ports/webinaire-repository.interface";
import { Executable } from "../../shared/executable";
import { WebinaireNotFoundException } from "../exceptions/webinaire-not-found";
import { WebinaireUpdateForbiddenException } from "../exceptions/webinaire-update-forbidden";
import { WebinaireNoSeatsException } from "../exceptions/webinaire-no-seats";
import { WebinaireTooManySeatsException } from "../exceptions/webinaire-too-many-seats";
import { CannotReduceSeatsException } from "../exceptions/cannot-reduce-seats";

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
      throw new WebinaireNotFoundException();
    }

    if (!webinaire.isOrganizer(user)) {
      throw new WebinaireUpdateForbiddenException();
    }

    if (seats < webinaire.props.seats) {
      throw new CannotReduceSeatsException();
    }

    if (webinaire.hasNoSeats()) {
      throw new WebinaireNoSeatsException();
    }

    webinaire.update({ seats });

    if (webinaire.hasTooManySeats()) {
      throw new WebinaireTooManySeatsException();
    }

    await this.repository.update(webinaire);
  }
}
