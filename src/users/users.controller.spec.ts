import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: '5566@test.com',
          password: '123456',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([
          {
            id: 1,
            email,
            password: '123456',
          } as User,
        ]);
      },
      remove: (id: number) => {
        return Promise.resolve({
          id: null,
          email: '5566@test.com',
        } as User);
      },
      update: (id: number, attrs: Partial<User>) => {
        return Promise.resolve({
          id,
          email: attrs.email as string,
          password: attrs.password as string,
        } as User);
      },
    };
    fakeAuthService = {
      signup: (email: string, password: string) => {
        return Promise.resolve({
          id: 1,
          email,
          password,
        } as User);
      },
      signin: (email: string, password: string) => {
        return Promise.resolve({
          id: 1,
          email,
          password,
        } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('5566@test.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('5566@test.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('siginin updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      { email: '5566@test.com', password: '123456' },
      session,
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });

  it('whoAmI finds user from session', async () => {
    const user = await controller.whoAmI({
      id: 1,
      email: '5566@test.com',
    } as User);
    expect(user).toBeDefined();
  });

  it('signout removes userId from session', async () => {
    const session = { userId: 1 };
    const user = await controller.signout(session);
    expect(session.userId).toBeNull();
  });

  it('signup creates a new user and returns the user', async () => {
    const session = { userId: 9 };
    const user = await controller.createUser(
      {
        email: '5566@test.com',
        password: '123456',
      },
      session,
    );
    expect(user.id).toEqual(1);
  });

  it('removeUser removes user with given id', async () => {
    const user = await controller.removeUser('1');
    expect(user.id).toEqual(null);
  });

  it('updateUser updates user with given id and attrs', async () => {
    const user = await controller.updateUser('1', {
      email: '55688@test.com',
      password: '123456',
    });
    expect(user.email).toEqual('55688@test.com');
  });
});
