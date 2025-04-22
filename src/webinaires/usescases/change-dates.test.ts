import { testUsers } from 'src/users/tests/user-seeds';
import { ChangeDates } from './change-dates';
import { addDays } from 'date-fns';
import { Webinaire } from '../entities/webinaire.entity';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire.repository';
import { FixedDateGenerator } from 'src/core/adapters/fixed-date-generator';

describe('Feature: Changing the dates of a webinaire', () => {
  const webinaire = new Webinaire({
    id: 'id-1',
    organizerId: 'alice',
    seats: 50,
    title: 'My first webinaire',
    startDate: new Date('2023-01-10T10:00:00.000Z'),
    endDate: new Date('2023-01-10T11:00:00.000Z'),
  });

  let repository: InMemoryWebinaireRepository;
  let dateGenerator: FixedDateGenerator;
  let useCase: ChangeDates;

  beforeEach(async () => {
    repository = new InMemoryWebinaireRepository([webinaire]);
    dateGenerator = new FixedDateGenerator();
    useCase = new ChangeDates(repository, dateGenerator);
  });

  describe('Scenario: Happy Path', () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: 'id-1',
      startDate: new Date('2023-01-20T07:00:00.000Z'),
      endDate: new Date('2023-01-21T08:00:00.000Z'),
    };

    it('Should change dates', async () => {
      await useCase.execute(payload);
      const updatedWebinaire = repository.findByIdSync('id-1')!;

      expect(updatedWebinaire.props.startDate).toEqual(payload.startDate);
      expect(updatedWebinaire.props.endDate).toEqual(payload.endDate);
    });
  });

  describe('Scenario: Webinaire does not exist', () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: 'id-2',
      startDate: new Date('2023-01-20T07:00:00.000Z'),
      endDate: new Date('2023-01-21T08:00:00.000Z'),
    };

    it('Should fail if the webinaire is not found', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        'Webinaire not found',
      );
      const updatedWebinaire = repository.findByIdSync('id-1')!;

      expect(updatedWebinaire.props.startDate).toEqual(
        webinaire.props.startDate,
      );
      expect(updatedWebinaire.props.endDate).toEqual(webinaire.props.endDate);
    });
  });

  describe('Scenario: Updating the seminaire of someone', () => {
    const payload = {
      user: testUsers.bob,
      webinaireId: 'id-1',
      startDate: new Date('2023-01-20T07:00:00.000Z'),
      endDate: new Date('2023-01-21T08:00:00.000Z'),
    };

    it('Should fail', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        'You are not allowed to update this webinaire',
      );

      const updatedWebinaire = repository.findByIdSync('id-1')!;
      expect(updatedWebinaire.props.startDate).toEqual(
        webinaire.props.startDate,
      );
      expect(updatedWebinaire.props.endDate).toEqual(webinaire.props.endDate);
    });
  });

  describe('Scenario: Updating the seminaire of someone', () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: 'id-1',
      startDate: new Date('2023-01-20T07:00:00.000Z'),
      endDate: new Date('2023-01-21T08:00:00.000Z'),
    };

    it('Should fail', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        'The webinaire must happen in at least 3 days',
      );

      // const updatedWebinaire = repository.findByIdSync('id-1')!;
      // expect(updatedWebinaire.props.startDate).toEqual(
      //   webinaire.props.startDate,
      // );
      // expect(updatedWebinaire.props.endDate).toEqual(webinaire.props.endDate);
    });
  });
});
