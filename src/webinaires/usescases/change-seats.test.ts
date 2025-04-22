import { ChangeSeats } from './change-seats';
import { Webinaire } from '../entities/webinaire.entity';
import { addDays } from 'date-fns';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire.repository';
import { testUsers } from 'src/users/tests/user-seeds';

describe('Features: Changing number of seats', () => {
  function expectSeatsToRemainUnchanged(data: number) {
    const webinaire = repository.findByIdSync('id-1');
    expect(webinaire!.props.seats).toEqual(data);
  }

  const webinaire = new Webinaire({
    id: 'id-1',
    organizerId: 'alice',
    seats: 50,
    title: 'My first webinaire',
    startDate: addDays(new Date(), 4),
    endDate: addDays(new Date(), 5),
  });

  let repository: InMemoryWebinaireRepository;
  let useCase: ChangeSeats;

  beforeEach(async () => {
    repository = new InMemoryWebinaireRepository([webinaire]);
    useCase = new ChangeSeats(repository);
  });

  describe('Scenario: Happy Path', () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: 'id-1',
      seats: 100,
    };
    it('Should change the number of seats', async () => {
      await useCase.execute(payload);
      expectSeatsToRemainUnchanged(100);
    });
  });

  describe('Scenario: webinaire does not exist', () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: 'id-2',
      seats: 50,
    };
    it('Should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'webinaire not found',
      );
      expectSeatsToRemainUnchanged(50);
    });
  });

  describe('Scenario: updating a webinaire of someone else', () => {
    const payload = {
      user: testUsers.bob,
      webinaireId: 'id-1',
      seats: 50,
    };

    it('Should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'You are not allowed to update this webinaire',
      );
      expectSeatsToRemainUnchanged(50);
    });
  });

  describe('Scenario: Reducing the number of seats', () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: 'id-1',
      seats: 49,
    };
    it('Should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'You cannot reduce number of seats',
      );
      const webinaire = await repository.findById('id-1');
      expect(webinaire!.props.seats).toEqual(50);
    });
  });

  describe('Scenario: Le webinaire doit avoir un maximum de 1000 places', () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: 'id-1',
      seats: 1001,
    };
    it('Shoul return an error', async () => {
      await expect(async () => useCase.execute(payload)).rejects.toThrow(
        'The webinaire must have a maximum of 1000 seats',
      );

      expectSeatsToRemainUnchanged(50);
    });
  });
});
