import { IUserRepository } from 'src/users/ports/user-repository.interface';
import { User } from '../entities/user.entity';

export interface IAuthenticator {
  authenticate(token: string): Promise<User>;
}

export class Authenticator implements IAuthenticator {
  constructor(private readonly userRepository: IUserRepository) {}

  async authenticate(token: string): Promise<User> {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [emailAddress, password] = decoded.split(':');

    const user = await this.userRepository.findbyEmailAddress(emailAddress);

    if (user === null) {
      throw new Error('Utilisateur non trouvé');
    }

    if (user.props.password !== password) {
      throw new Error('Mot de passe invalid');
    }

    return user;
  }
}
