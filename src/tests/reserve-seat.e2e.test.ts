import * as request from "supertest";
import { TestApp } from "./utils/test-app";
import { e2eUsers } from "./seeds/user-seeds.e2e";
import {
  I_PARTICIPATION_REPOSITORY,
  IParticipationRepository,
} from "../webinaires/ports/participation-repository.interface";
import { e2eWebinaires } from "./seeds/webinaire-seed.e2e";

describe("Feature: Reserving a seat", () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([
      e2eUsers.johnDoe,
      e2eUsers.bob,
      e2eWebinaires.webinaire1,
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe("Scenario: Happy Path", () => {
    it("Should succeed", async () => {
      const id = e2eWebinaires.webinaire1.entity.props.id;

      const result = await request(app.getHttpServer())
        .post(`/webinaires/${id}/participations`)
        .set("Authorization", e2eUsers.bob.createAuthorizationToken());

      expect(result.status).toBe(201);

      const participationRepository = app.get<IParticipationRepository>(
        I_PARTICIPATION_REPOSITORY
      );

      const participation = await participationRepository.findOne(
        e2eUsers.bob.entity.props.id,
        id
      ); 
      
      expect(participation).not.toBeNull();
    });
  });

  describe("Scenario: the user is not authenticated", () => {
    it("Should reject", async () => {
      const id = e2eWebinaires.webinaire1.entity.props.id;

      const result = await request(app.getHttpServer()).post(
        `/webinaires/${id}/participations`
      );

      expect(result.status).toBe(403);
    });
  });
});
