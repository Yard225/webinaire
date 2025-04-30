import { testUsers } from "../../users/tests/user-seeds";
import { Webinaire } from "../entities/webinaire.entity";
import { ReserveSeat } from "./reserve-seat";
import { InMemoryParticipationRepository } from "../adapters/in-memory-participation.repository";
import { InMemoryMailer } from "../../core/adapters/in-memory-mailer";
import { InMemoryWebinaireRepository } from "../adapters/in-memory-webinaire.repository";
import { InMemoryUserRepository } from "../../users/adapters/in-memory-user.repository";
import { Participation } from "../entities/participation.entity";

describe("Feature: Reserve seat", () => {
  function expectParticipationNotToBeCreated() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinaire.props.id
    );

    expect(storedParticipation).toBeNull();
  }

  function expectParticipationToBeCreated() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinaire.props.id
    );

    expect(storedParticipation).not.toBeNull();
  }

  const webinaire = new Webinaire({
    id: 'id-1',
    organizerId: 'alice',
    seats: 50,
    title: 'My first webinaire',
    startDate: new Date('2023-01-10T10:00:00.000Z'),
    endDate: new Date('2023-01-10T11:00:00.000Z'),
  });

  const webinaireWithFewSeats = new Webinaire({
    id: 'id-2',
    organizerId: 'alice',
    seats: 1,
    title: 'My first webinaire',
    startDate: new Date('2023-01-10T10:00:00.000Z'),
    endDate: new Date('2023-01-10T11:00:00.000Z'),
  });

  const charlesParticipation = new Participation({
    userId: 'charles',
    webinaireId: webinaireWithFewSeats.props.id,
  });

  let participationRepository: InMemoryParticipationRepository;
  let mailer: InMemoryMailer;
  let webinaireRepository: InMemoryWebinaireRepository;
  let userRepository: InMemoryUserRepository;
  let useCase: ReserveSeat;

  beforeEach(async () => {
    participationRepository = new InMemoryParticipationRepository([
      charlesParticipation,
    ]);

    mailer = new InMemoryMailer();

    webinaireRepository = new InMemoryWebinaireRepository([
      webinaire,
      webinaireWithFewSeats,
    ]);

    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
      testUsers.charles,
    ]);

    useCase = new ReserveSeat(
      participationRepository,
      mailer,
      webinaireRepository,
      userRepository
    );
  });

  describe("Scenario: Happy Path", () => { 
    const payload = {
      user: testUsers.bob,
      webinaireId: webinaire.props.id,
    };

    it("Should reserve a seat", async () => {
      await useCase.execute(payload);

      expectParticipationToBeCreated();
    });

    it("Should send an e-mail to the organiser", async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[0]).toEqual({
        to: testUsers.alice.props.emailAddress,
        subject: "New Participation",
        body: `A user want to reserve one seat`,
      });
    });

    it("Should send an e-mail to the participant", async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[1]).toEqual({
        to: testUsers.bob.props.emailAddress,
        subject: "Your participation to a website",
        body: `Your reservation was successfully set for the webinaire ${webinaire.props.title}`,
      });
    });
  });

  describe("Scenario: The webinaire does not exist", () => {
    const payload = {
      user: testUsers.bob,
      webinaireId: 'random-id',
    };
    it("Should fail", async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        'Webinaire not found',
      );

      expectParticipationNotToBeCreated();
    });
  });

  describe("Scenario: The webinaire does not have enough seats", () => {
    const payload = {
      user: testUsers.bob,
      webinaireId: webinaireWithFewSeats.props.id,
    };
    it("Should fail", async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        'No more seats available'
      );

      expectParticipationNotToBeCreated();
    });
  });

  describe("Scenario: user already participate in the webinaire", () => {
    const payload = {
      user: testUsers.charles,
      webinaireId: webinaireWithFewSeats.props.id,
    };
    it("Should fail", async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        "You are already participate in this webinaire"
      );

      expectParticipationNotToBeCreated();
    });
  });
});
