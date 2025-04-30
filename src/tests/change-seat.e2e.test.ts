import * as request from 'supertest';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user-seeds.e2e';
import {
  I_WEBINAIRE_REPOSITORY,
  IWebinaireRepository,
} from '../webinaires/ports/webinaire-repository.interface';
import { e2eWebinaires } from './seeds/webinaire-seed.e2e';

describe('Feature: Changing number of seats', () => {
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

  describe('Scenario: Happy Path', () => {
    it('Should succeed', async () => {
      const seats = 100;
      const id = e2eWebinaires.webinaire1.entity.props.id;

      const result = await request(app.getHttpServer())
        .post(`/webinaires/${id}/seats`)
        .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
        .send({
          seats,
        });

      expect(result.status).toBe(200);

      const webinaireRepository = app.get<IWebinaireRepository>(
        I_WEBINAIRE_REPOSITORY,
      );

      const webinaire = await webinaireRepository.findById(id);

      expect(webinaire).toBeDefined();
      expect(webinaire!.props.seats).toEqual(seats);
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('Should reject', async () => {
      const seats = 100;
      const id = e2eWebinaires.webinaire1.entity.props.id;

      const result = await request(app.getHttpServer())
        .post(`/webinaires/${id}/seats`)
        .send({ seats });

      expect(result.status).toBe(403);
    });
  });
});
