import { testUsers } from "../../users/tests/user-seeds";
import { CancelSeat } from "./cancel-seat";
import { Webinaire } from "../entities/webinaire.entity";
import { Participation } from "../entities/participation.entity";
import { InMemoryParticipationRepository } from "../adapters/in-memory-participation.repository";
import { InMemoryWebinaireRepository } from "../adapters/in-memory-webinaire.repository";
import { InMemoryUserRepository } from "../../users/adapters/in-memory-user.repository";
import { InMemoryMailer } from "../../core/adapters/in-memory-mailer";

describe("Feature: Cancel Seat ", () => {
  function expectParticipationNotToBeDeleted() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinaire.props.id
    );

    expect(storedParticipation).not.toBeNull();
  }
  function expectParticipationToBeCancel() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinaire.props.id
    );

    expect(storedParticipation).toBeNull();
  }

  const webinaire = new Webinaire({
    id: "id-1",
    organizerId: "alice",
    seats: 50,
    title: "My first webinaire",
    startDate: new Date("2023-01-10T10:00:00.000Z"),
    endDate: new Date("2023-01-10T11:00:00.000Z"),
  });

  const bobParticipation = new Participation({
    userId: testUsers.bob.props.id,
    webinaireId: webinaire.props.id,
  });

  let webinaireRepository: InMemoryWebinaireRepository;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let mailer: InMemoryMailer;
  let useCase: CancelSeat;

  beforeEach(async () => {
    webinaireRepository = new InMemoryWebinaireRepository([webinaire]);

    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);

    userRepository = new InMemoryUserRepository([
      testUsers.bob,
      testUsers.alice,
    ]);

    mailer = new InMemoryMailer();

    useCase = new CancelSeat(
      webinaireRepository,
      participationRepository,
      userRepository,
      mailer
    );
  });

  describe("Scenario: Happy Path", () => {
    const payload = {
      user: testUsers.bob,
      webinaireId: webinaire.props.id,
    };

    it("Should cancel the seat ", async () => {
      await useCase.execute(payload);

      expectParticipationToBeCancel();
    });

    it("Should send an e-mail to the organizer", async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[0]).toEqual({
        to: testUsers.alice.props.emailAddress,
        subject: "Bob has canceled their seat",
        body: `Bob has canceled their seat for the webinaire ${webinaire.props.title}`,
      });
    });

    it("Should send an e-mail to participant", async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[1]).toEqual({
        to: testUsers.bob.props.emailAddress,
        subject: "Your participation cancellation",
        body: `You have canceled your participation to the webinaire ${webinaire.props.title}`,
      });
    });
  });

  describe("Scenario: Webinaire does not exist", () => {
    const payload = {
      user: testUsers.bob,
      webinaireId: "random-id",
    };
    it("Should succeed", async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        "Webinaire not found"
      );

      expectParticipationNotToBeDeleted();
    });
  });

  describe("Scenario: The user did not reserve a seat", () => {
    const payload = {
      user: testUsers.charles,
      webinaireId: webinaire.props.id,
    };
    it("Should succeed", async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        "No participation found"
      );

      expectParticipationNotToBeDeleted();
    });
  });
});
