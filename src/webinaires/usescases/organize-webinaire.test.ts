import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire.repository';
import { OrganizerWebinaire } from './organize-webinaire';
import { FixedIDGenerator } from '../../core/adapters/fixed-id-generator';
import { Webinaire } from '../entities/webinaire.entity';
import { FixedDateGenerator } from '../../core/adapters/fixed-date-generator';
import { testUsers } from 'src/users/tests/user-seeds';

describe('Fonctionnalité: Organiser un webinaire', () => {
  function expectWebinaireToEqual(webinaire: Webinaire) {
    expect(webinaire.props).toEqual({
      id: 'id-1',
      organizerId: 'alice',
      title: 'My first webinaire',
      seats: 100,
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T10:00:00.000Z'),
    });
  }

  let repository: InMemoryWebinaireRepository;
  let idGenerator: FixedIDGenerator;
  let dateGenerator: FixedDateGenerator;
  let useCase: OrganizerWebinaire;

  beforeEach(async () => {
    repository = new InMemoryWebinaireRepository();
    idGenerator = new FixedIDGenerator();
    dateGenerator = new FixedDateGenerator();
    useCase = new OrganizerWebinaire(repository, idGenerator, dateGenerator);
  });

  describe('Scenario: créer un webinaire', () => {
    const payload = {
      user: testUsers.alice,
      title: 'My first webinaire',
      seats: 100,
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T10:00:00.000Z'),
    };
    it('Devrait nous retourner un ID', async () => {
      const result = await useCase.execute(payload);
      expect(result.id).toBe('id-1');
    });
    it('Devrait insérer les données dans la BDD', async () => {
      await useCase.execute(payload);
      expect(repository.database.length).toBe(1);

      const createdWebinaire = repository.database[0];
      expectWebinaireToEqual(createdWebinaire);
    });
  });

  describe('Scenario: Le webinaire doit être organiser 03 jours avant la date de début', () => {
    const payload = {
      user: testUsers.alice,
      title: 'My first webinaire',
      seats: 100,
      startDate: new Date('2023-01-03T10:00:00.000Z'),
      endDate: new Date('2023-01-10T10:00:00.000Z'),
    };
    it('Devrait retourner une erreur', async () => {
      await expect(async () => useCase.execute(payload)).rejects.toThrow(
        'Le webinaire doit être organiser 03 jours avant la date de début',
      );
    });
    it('Devrait ne pas créer un webinaire', async () => {
      try {
        await useCase.execute(payload);
      } catch (e) {
        console.log(`Exception while doing something: ${e}`);
      }
      expect(repository.database.length).toBe(0);
    });
  });

  describe('Scenario: Le webinaire doit avoir un maximum de 1000 places', () => {
    const payload = {
      user: testUsers.alice,
      title: 'My first webinaire',
      seats: 1001,
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T10:00:00.000Z'),
    };
    it('Devrait retourner une erreur', async () => {
      await expect(async () => useCase.execute(payload)).rejects.toThrow(
        'La capacité du webinaire est de 1000 places',
      );
    });
    it('Devrait ne pas créer un webinaire', async () => {
      try {
        await useCase.execute(payload);
      } catch (e) {
        console.log(`Exception while doing something: ${e}`);
      }
      expect(repository.database.length).toBe(0);
    });
  });

  describe('Scenario: Le webinaire doit avoir au minimum de 1 place', () => {
    const payload = {
      user: testUsers.alice,
      title: 'My first webinaire',
      seats: 0,
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T10:00:00.000Z'),
    };
    it('Devrait retourner une erreur', async () => {
      await expect(async () => useCase.execute(payload)).rejects.toThrow(
        'Le nombre de place au webinaire soit être de minimum 1 place',
      );
    });
    it('Devrait ne pas créer un webinaire', async () => {
      try {
        await useCase.execute(payload);
      } catch (e) {
        console.log(`Exception while doing something: ${e}`);
      }
      expect(repository.database.length).toBe(0);
    });
  });
});
