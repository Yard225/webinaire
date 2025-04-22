import { InMemoryUserRepository } from 'src/users/adapters/in-memory-user.repository';
import { Authenticator } from './authenticator';
import { User } from 'src/users/entities/user.entity';

describe('Authenticator', () => {
  let authenticator: Authenticator;
  let repository: InMemoryUserRepository;

  beforeEach(async () => {
    repository = new InMemoryUserRepository();
    await repository.create(
      new User({
        id: 'id-1',
        emailAddress: 'johndoe@gmail.com',
        password: 'azerty',
      }),
    );
    authenticator = new Authenticator(repository);
  });

  describe('Case: the token is valid', () => {
    it('should authenticate the user', async () => {
      const payload = Buffer.from('johndoe@gmail.com:azerty').toString(
        'base64',
      );

      const user = await authenticator.authenticate(payload);

      expect(user.props).toEqual({
        id: 'id-1',
        emailAddress: 'johndoe@gmail.com',
        password: 'azerty',
      });
    });
  });

  describe('Case: the user does not exist', () => {
    it('should failed if the user exist', async () => {
      const payload = Buffer.from('unknow@gmail.com:azerty').toString('base64');

      const authenticator = new Authenticator(repository);

      await expect(() => authenticator.authenticate(payload)).rejects.toThrow(
        'Utilisateur non trouvé',
      );
    });
  });

  describe('Case: the password is not valid', () => {
    it('should failed if the user exist', async () => {
      const payload = Buffer.from('johndoe@gmail.com:not-valid').toString(
        'base64',
      );

      const authenticator = new Authenticator(repository);

      await expect(() => authenticator.authenticate(payload)).rejects.toThrow(
        'Mot de passe invalid',
      );
    });
  });
});
