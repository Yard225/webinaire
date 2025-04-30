import { Executable } from "src/shared/executable";
import { User } from "src/users/entities/user.entity";
import { IParticipationRepository } from "../ports/participation-repository.interface";
import { Participation } from "../entities/participation.entity";
import { IMailer } from "src/core/ports/mailer.interface";
import { IWebinaireRepository } from "../ports/webinaire-repository.interface";
import { IUserRepository } from "src/users/ports/user-repository.interface";
import { Webinaire } from "../entities/webinaire.entity";
import { WebinaireNotFoundException } from "../exceptions/webinaire-not-found";
import { NoMoreSeatAvailableException } from "../exceptions/no-more-seat-available";
import { AlreadyParticipateToWebinaireException } from "../exceptions/already-participate-to-webinaire";

type Request = {
  user: User;
  webinaireId: string;
};

type Response = void;

export class ReserveSeat implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly mailer: IMailer,
    private readonly webinaireRepository: IWebinaireRepository,
    private readonly usersRepository: IUserRepository
  ) {}

  async execute({ user, webinaireId }: Request): Promise<void> {
    const webinaire = await this.webinaireRepository.findById(webinaireId);

    if (!webinaire) {
      throw new WebinaireNotFoundException();
    }

    await this.assertUserIsNotAlreadyParticipating(user, webinaire);
    await this.assertHasEnoughSeats(webinaire);

    const participation = new Participation({
      userId: user.props.id,
      webinaireId: webinaireId,
    });

    await this.participationRepository.create(participation);

    await this.sendEmailToOrganizer(webinaire);
    await this.sendEmailToParticipant(webinaire, user);
  }

  private async assertUserIsNotAlreadyParticipating(
    user: User,
    webinaire: Webinaire
  ): Promise<void> {
    const existingParticipation = await this.participationRepository.findOne(
      user.props.id,
      webinaire.props.id
    );

    if (existingParticipation) {
      throw new AlreadyParticipateToWebinaireException();
    }
  }

  private async assertHasEnoughSeats(webinaire: Webinaire): Promise<void> {
    const participationCount =
      await this.participationRepository.findParticipationCount(
        webinaire.props.id
      );

    if (participationCount >= webinaire.props.seats) {
      throw new NoMoreSeatAvailableException();
    }
  }

  private async sendEmailToOrganizer(webinaire: Webinaire): Promise<void> {
    const organizer = await this.usersRepository.findById(
      webinaire.props.organizerId
    );

    await this.mailer.send({
      to: organizer!.props.emailAddress,
      subject: "New Participation",
      body: "A user want to reserve one seat",
    });
  }

  private async sendEmailToParticipant(
    webinaire: Webinaire,
    user: User
  ): Promise<void> {
    await this.mailer.send({
      to: user.props.emailAddress,
      subject: "Your participation to a website",
      body: `Your reservation was successfully set for the webinaire ${webinaire.props.title}`,
    });
  }
}
