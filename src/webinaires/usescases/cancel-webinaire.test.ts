import { testUsers } from "src/users/tests/user-seeds";
import { CancelWebinaire } from "./cancel-webinaire";
import { Webinaire } from "../entities/webinaire.entity";
import { InMemoryWebinaireRepository } from "../adapters/in-memory-webinaire.repository";
import { InMemoryMailer } from "src/core/adapters/in-memory-mailer";
import { InMemoryParticipationRepository } from "../adapters/in-memory-participation.repository";
import { InMemoryUserRepository } from "src/users/adapters/in-memory-user.repository";
import { Participation } from "../entities/participation.entity";

describe("Feature: Cancel Webinaire", () => {
  async function expectWebinaireNotToBeDeleted() {
    const storedWebinaire = repository.findByIdSync(webinaire.props.id);
    expect(storedWebinaire).not.toBeNull();
  }

  function expectWebinaireToBeDeleted() {
    const deletedWebinaire = repository.findByIdSync(webinaire.props.id);
    expect(deletedWebinaire).toBeNull();
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

  let useCase: CancelWebinaire;
  let mailer: InMemoryMailer;
  let repository: InMemoryWebinaireRepository;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;

  beforeEach(async () => {
    repository = new InMemoryWebinaireRepository([webinaire]);
    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);

    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
    ]);

    mailer = new InMemoryMailer();

    useCase = new CancelWebinaire(
      repository,
      userRepository,
      participationRepository,
      mailer
    );
  });

  describe("Scenario: Happy Path", () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: webinaire.props.id,
    };

    it("Should succeed", async () => {
      await useCase.execute(payload);
      expectWebinaireToBeDeleted();
    });

    it("Should send an e-mail to the participants", async () => {
      await useCase.execute(payload);
      expect(mailer.sentEmails).toEqual([
        {
          to: testUsers.bob.props.emailAddress,
          subject: "Webinaire Cancelled",
          body: "Test Webinaire deletion",
        },
      ]);
    });
  });

  describe("Scenario: Webinaire does not exist", () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: "id-2",
    };
    it("Should succeed", async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        "Webinaire not found"
      );
      await expectWebinaireNotToBeDeleted();
    });
  });

  describe("Scenario: deleting webinaire of someone else", () => {
    const payload = {
      user: testUsers.bob,
      webinaireId: webinaire.props.id,
    };

    it("Should fail", async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        "You are not allowed to update this webinaire"
      );
      await expectWebinaireNotToBeDeleted();
    });
  });
});
