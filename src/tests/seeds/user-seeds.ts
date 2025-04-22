import { User } from '../../users/entities/user.entity';
import { UserFixtures } from '../fixtures/user-fixture';

export const e2eUsers = {
  johnDoe: new UserFixtures(
    new User({
      id: 'john-doe',
      emailAddress: 'johndoe@gmail.com',
      password: 'azerty',
    }),
  ),
};
