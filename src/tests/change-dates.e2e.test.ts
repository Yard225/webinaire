import { addDays } from "date-fns";
import * as request from "supertest";
import { TestApp } from "./utils/test-app";
import { e2eUsers } from "./seeds/user-seeds.e2e";
import {
  I_WEBINAIRE_REPOSITORY,
  IWebinaireRepository,
} from "../webinaires/ports/webinaire-repository.interface";
import { e2eWebinaires } from "./seeds/webinaire-seed.e2e";

describe("Feature: Changing the dates of webinaire", () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([e2eUsers.johnDoe, e2eWebinaires.webinaire1]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe("Scenario: Happy Path", () => {
    it("Should succeed", async () => {
      const startDate = addDays(new Date(), 5);
      const endDate = addDays(new Date(), 6);
      const id = e2eWebinaires.webinaire1.entity.props.id;

      const result = await request(app.getHttpServer())
        .post(`/webinaires/${id}/dates`)
        .set("Authorization", e2eUsers.johnDoe.createAuthorizationToken())
        .send({
          startDate,
          endDate,
        });

      expect(result.status).toBe(200);

      const webinaireRepository = app.get<IWebinaireRepository>(
        I_WEBINAIRE_REPOSITORY
      );

      const webinaire = await webinaireRepository.findById(id);

      expect(webinaire).toBeDefined();
      expect(webinaire!.props.startDate).toEqual(startDate);
      expect(webinaire!.props.endDate).toEqual(endDate);
    });
  });

  describe("Scenario: the user is not authenticated", () => {
    it("Should reject", async () => {
      const startDate = addDays(new Date(), 5);
      const endDate = addDays(new Date(), 6);
      const id = e2eWebinaires.webinaire1.entity.props.id;

      const result = await request(app.getHttpServer())
        .post(`/webinaires/${id}/dates`)
        .send({ startDate, endDate });

      expect(result.status).toBe(403);
    });
  });
});
