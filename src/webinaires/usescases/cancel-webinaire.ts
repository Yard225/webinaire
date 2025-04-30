import { Executable } from "src/shared/executable";
import { User } from "src/users/entities/user.entity";
import { IWebinaireRepository } from "../ports/webinaire-repository.interface";
import { WebinaireNotFoundException } from "../exceptions/webinaire-not-found";
import { WebinaireUpdateForbiddenException } from "../exceptions/webinaire-update-forbidden";
import { IMailer } from "src/core/ports/mailer.interface";
import { IParticipationRepository } from "../ports/participation-repository.interface";
import { IUserRepository } from "src/users/ports/user-repository.interface";
import { Webinaire } from "../entities/webinaire.entity";

type Request = {
  user: User;
  webinaireId: string;
};

type Response = void;

export class CancelWebinaire implements Executable<Request, Response> {
  constructor(
    private readonly repository: IWebinaireRepository,
    private readonly usersRepository: IUserRepository,
    private readonly participationRepository: IParticipationRepository,
    private readonly mailer: IMailer
  ) {}

  async execute(request: Request): Promise<void> {
    const webinaire = await this.repository.findById(request.webinaireId);

    if (!webinaire) {
      throw new WebinaireNotFoundException();
    }

    if (!webinaire.isOrganizer(request.user)) {
      throw new WebinaireUpdateForbiddenException();
    }

    await this.repository.delete(webinaire);

    await this.sendEmailToParticipants(webinaire);
  }

  private async sendEmailToParticipants(webinaire: Webinaire): Promise<void> {
    const participations = await this.participationRepository.findByWebinaireId(
      webinaire.props.id
    );

    const users = (
      await Promise.all(
        participations.map((p) => this.usersRepository.findById(p.props.userId))
      )
    ).filter((user): user is User => user !== null);

    await Promise.all(
      users.map((user) =>
        this.mailer.send({
          to: user.props.emailAddress,
          subject: "Webinaire Cancelled",
          body: "Test Webinaire deletion",
        })
      )
    );
  }
}
