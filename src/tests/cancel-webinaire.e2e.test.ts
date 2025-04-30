import * as request from "supertest";
import { TestApp } from "./utils/test-app";
import { e2eUsers } from "./seeds/user-seeds.e2e";
import {
  I_WEBINAIRE_REPOSITORY,
  IWebinaireRepository,
} from "../webinaires/ports/webinaire-repository.interface";
import { e2eWebinaires } from "./seeds/webinaire-seed.e2e";

describe("Feature: Cancelling the webinaire", () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([
      e2eUsers.johnDoe,
      e2eWebinaires.webinaire1
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe("Scenario: Happy Path", () => {
    it("Should succeed", async () => {
      const id = e2eWebinaires.webinaire1.entity.props.id;

      const result = await request(app.getHttpServer())
        .delete(`/webinaires/${id}`)
        .set("Authorization", e2eUsers.johnDoe.createAuthorizationToken());

      expect(result.status).toBe(200);

      const webinaireRepository = app.get<IWebinaireRepository>(
        I_WEBINAIRE_REPOSITORY
      );

      const webinaire = await webinaireRepository.findById(id);

      expect(webinaire).toBeNull();
    });
  });

  describe("Scenario: the user is not authenticated", () => {
    it("Should reject", async () => {
      const id = e2eWebinaires.webinaire1.entity.props.id;

      const result = await request(app.getHttpServer()).delete(
        `/webinaires/${id}`
      );

      expect(result.status).toBe(403);
    });
  });
});
