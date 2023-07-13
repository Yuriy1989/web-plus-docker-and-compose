import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, QueryFailedError, Repository } from 'typeorm';
import { createHash } from '../utils/hash';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    const hash = await createHash(password);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hash,
    });
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.driverError.code === '23505') {
          throw new ConflictException(
            'Пользователь с таким email или username уже зарегистрирован',
          );
        }
      }
    }
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  async findMy(query: FindOneOptions<User>): Promise<User> {
    const user = await this.userRepository.findOneOrFail(query);
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ username });
    return user;
  }

  async findMany(query: string): Promise<Array<User>> {
    const users = await this.userRepository.find({
      where: [{ username: query }, { email: query }],
    });
    if (!users) {
      throw new ConflictException(
        'Пользователь с таким email или username не найден.',
      );
    }
    return users;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { password } = updateUserDto;
    const user = await this.findOne(id);
    try {
      if (password) {
        updateUserDto.password = await createHash(password);
      }
      return await this.userRepository.save({ ...user, ...updateUserDto });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.driverError.code === '23505') {
          throw new ConflictException(
            'Пользователь с таким email или username уже зарегистрирован.',
          );
        }
      }
    }
  }
}
