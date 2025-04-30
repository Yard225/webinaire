import { testUsers } from "../../users/tests/user-seeds";
import { Webinaire } from "../entities/webinaire.entity";
import { InMemoryWebinaireRepository } from "../adapters/in-memory-webinaire.repository";
import { FixedDateGenerator } from "../../core/adapters/fixed-date-generator";
import { Participation } from "../entities/participation.entity";
import { InMemoryParticipationRepository } from "../adapters/in-memory-participation.repository";
import { InMemoryMailer } from "../../core/adapters/in-memory-mailer";
import { InMemoryUserRepository } from "../../users/adapters/in-memory-user.repository";
import { ChangeDates } from "./change-dates";

describe("Feature: Changing the dates of a webinaire", () => {
  function expctDatesToRemainUnchanged() {
    const updatedWebinaire = repository.findByIdSync("id-1")!;
    expect(updatedWebinaire.props.startDate).toEqual(webinaire.props.startDate);
    expect(updatedWebinaire.props.endDate).toEqual(webinaire.props.endDate);
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

  let repository: InMemoryWebinaireRepository;
  let dateGenerator: FixedDateGenerator;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let mailer: InMemoryMailer;
  let useCase: ChangeDates;

  beforeEach(async () => {
    repository = new InMemoryWebinaireRepository([webinaire]);
    dateGenerator = new FixedDateGenerator();
    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);
    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
    ]);
    mailer = new InMemoryMailer();
    useCase = new ChangeDates(
      repository,
      dateGenerator,
      participationRepository,
      userRepository,
      mailer
    );
  });

  describe("Scenario: Happy Path", () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: "id-1",
      startDate: new Date("2023-01-20T07:00:00.000Z"),
      endDate: new Date("2023-01-21T08:00:00.000Z"),
    };

    it("Should change dates", async () => {
      await useCase.execute(payload);
      const updatedWebinaire = repository.findByIdSync("id-1")!;

      expect(updatedWebinaire.props.startDate).toEqual(payload.startDate);
      expect(updatedWebinaire.props.endDate).toEqual(payload.endDate);
    });

    it("Should send an email to all participants", async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails).toEqual([
        {
          to: testUsers.bob.props.emailAddress,
          subject: "Test",
          body: "Test",
        },
      ]);
    });
  });

  describe("Scenario: Webinaire does not exist", () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: "id-2",
      startDate: new Date("2023-01-20T07:00:00.000Z"),
      endDate: new Date("2023-01-21T08:00:00.000Z"),
    };

    it("Should fail if the webinaire is not found", async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        "Webinaire not found"
      );
      expctDatesToRemainUnchanged();
    });
  });

  describe("Scenario: Updating the seminaire of someone", () => {
    const payload = {
      user: testUsers.bob,
      webinaireId: "id-1",
      startDate: new Date("2023-01-20T07:00:00.000Z"),
      endDate: new Date("2023-01-21T08:00:00.000Z"),
    };

    it("Should fail", async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        "You are not allowed to update this webinaire"
      );
      expctDatesToRemainUnchanged();
    });
  });

  describe("Scenario: Updating the seminaire of someone", () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: "id-1",
      startDate: new Date("2023-01-03T10:00:00.000Z"),
      endDate: new Date("2023-01-01T10:00:00.000Z"),
    };

    it("Should fail", async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        "The webinaire must happen in at least 3 days"
      );
      expctDatesToRemainUnchanged();
    });
  });
});
