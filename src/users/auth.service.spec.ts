import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },

      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    // Create an instance of the auth service
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  // signup function test
  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  // signup encrypt password test
  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('5566@test.com', '123456');
    // expect the user's password is encrypted
    expect(user.password).not.toEqual('123456');
    const [salt, hash] = user.password.split('.');
    // expect the user's password is hashed and salted
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  // signup email in use test
  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('5566@test.com', '123456');
    await expect(service.signup('5566@test.com', '123456')).rejects.toThrow(
      BadRequestException,
    );
  });

  // signin function test
  it('throws if signin is called with an unused email', async () => {
    await expect(service.signin('5566@test.com', '123456')).rejects.toThrow(
      NotFoundException,
    );
  });

  // signin wrong password test
  it('throws if an invalid password is provided', async () => {
    await service.signup('5566@test.com', '123456');

    await expect(service.signin('5566@test.com', '12345678')).rejects.toThrow(
      BadRequestException,
    );
  });

  // signin correct password test
  it('returns a user if correct password is provided', async () => {
    // The brutal way:
    // fakeUsersService.find = () =>
    //   Promise.resolve([
    //     {
    //       email: '5566@test.com',
    //       password:
    //         'ae1c0c6b20470e9b.5142cdbc7f249a904b96b1c54ab03ae57d902d5ad263b75008e38379c7cfafe6',
    //     } as User,
    //   ]);

    // The realistic way:
    await service.signup('5566@test.com', '123456');
    const user = await service.signin('5566@test.com', '123456');
    expect(user).toBeDefined();
  });
});

//   it('throws an error if user signs up with email that is in use', async () => {
//   await service.signup('asdf@asdf.com', 'asdf');
//   await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
//     BadRequestException,
//   );
// });

// it('throws if signin is called with an unused email', async () => {
//   await expect(
//     service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
//   ).rejects.toThrow(NotFoundException);
// });

// it('throws if an invalid password is provided', async () => {
//   await service.signup('laskdjf@alskdfj.com', 'password');
//   await expect(
//     service.signin('laskdjf@alskdfj.com', 'laksdlfkj'),
//   ).rejects.toThrow(BadRequestException);
// });
