import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _script } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_script);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // See if email is in use
    const users = await this.usersService.find(email);
    // If email is in use, throw an error
    if (users.length) {
      throw new BadRequestException('email in use');
    }
    // If email is not in use, hash the password
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // Join the hashed result and the salt together
    const result = salt + '.' + hash.toString('hex');

    // Create a new user and save it
    const user = await this.usersService.create(email, result);
    // Return the user
    return user;
  }

  async signin(email: string, password: string) {
    // Find the user in the database
    const [user] = await this.usersService.find(email);
    // If no user, throw an error
    if (!user) {
      throw new NotFoundException('user not found');
    }
    // If user exists, hash the provided password
    const [salt, storedassword] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // Compare the hashed password with the password from the database
    if (storedassword !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }
    return user;
  }
}
