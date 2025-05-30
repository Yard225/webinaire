import { Executable } from "../../shared/executable";
import { User } from "../../users/entities/user.entity";
import { IWebinaireRepository } from "../ports/webinaire-repository.interface";
import { IDateGenerator } from "../../core/ports/fixed-date-generator.interface";
import { IParticipationRepository } from "../ports/participation-repository.interface";
import { IMailer } from "../../core/ports/mailer.interface";
import { IUserRepository } from "../../users/ports/user-repository.interface";
import { Webinaire } from "../entities/webinaire.entity";
import { WebinaireNotFoundException } from "../exceptions/webinaire-not-found";
import { WebinaireUpdateForbiddenException } from "../exceptions/webinaire-update-forbidden";
import { WebinaireTooEarlyException } from "../exceptions/webinaire-too-early";

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
    private readonly participationRepository: IParticipationRepository,
    private readonly usersRepository: IUserRepository,
    private readonly mailer: IMailer
  ) {}

  async execute(request: Request): Promise<Response> {
    const webinaire = await this.repository.findById(request.webinaireId);

    if (!webinaire) {
      throw new WebinaireNotFoundException();
    }

    if (!webinaire.isOrganizer(request.user)) {
      throw new WebinaireUpdateForbiddenException();
    }

    webinaire.update({
      startDate: request.startDate,
      endDate: request.endDate,
    });

    if (webinaire.itTooClose(this.dateGenerator.now())) {
      throw new WebinaireTooEarlyException();
    }

    await this.repository.update(webinaire);
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
          subject: "Test",
          body: "Test",
        })
      )
    );
  }
}
