import {
  I_USER_REPOSITORY,
  IUserRepository,
} from '../../users/ports/user-repository.interface';
import { IFixture } from '../utils/fixtures.interface';
import { TestApp } from '../utils/test-app';
import { User } from '../../users/entities/user.entity';

export class UserFixtures implements IFixture {
  constructor(public entity: User) {}

  async load(app: TestApp): Promise<void> {
    const userRepository = app.get<IUserRepository>(I_USER_REPOSITORY);
    await userRepository.create(this.entity);
  }

  createAuthorizationToken() {
    return (
      'Basic ' +
      Buffer.from(
        `${this.entity.props.emailAddress}:${this.entity.props.password}`,
      ).toString('base64')
    );
  }
}
