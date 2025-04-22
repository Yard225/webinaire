import { addDays } from 'date-fns';
import * as request from 'supertest';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user-seeds';
import {
  I_WEBINAIRE_REPOSITORY,
  IWebinaireRepository,
} from '../webinaires/ports/webinaire-repository.interface';
import { WebinaireFixtures } from './fixtures/webinaire-fixture';
import { Webinaire } from '../webinaires/entities/webinaire.entity';

describe('Feature: Changing number of seats', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([
      e2eUsers.johnDoe,
      new WebinaireFixtures(
        new Webinaire({
          id: 'id-1',
          organizerId: e2eUsers.johnDoe.entity.props.id,
          seats: 50,
          title: 'My first webinaire',
          startDate: addDays(new Date(), 4),
          endDate: addDays(new Date(), 5),
        }),
      ),
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: Happy Path', () => {
    it('Scenario: Création du webinaire', async () => {
      const seats = 100;
      const id = 'id-1';

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
      const id = 'id-1';

      const result = await request(app.getHttpServer())
        .post(`/webinaires/${id}/seats`)
        .send({ seats });

      expect(result.status).toBe(403);
    });
  });
});
