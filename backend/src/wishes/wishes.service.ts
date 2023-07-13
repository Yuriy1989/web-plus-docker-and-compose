import { ForbiddenException, Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { LAST_TAKE, SKIP, TOP_TAKE } from '../constants';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(user: User, createWishDto) {
    const wish = this.wishRepository.create({
      ...createWishDto,
      copied: 1,
      owner: user,
    });
    return this.wishRepository.save(wish);
  }

  async findAll(): Promise<Wish[]> {
    return await this.wishRepository.find({
      relations: { owner: true, offers: { user: true } },
    });
  }

  async findAllMyWishes(id: number): Promise<Array<Wish>> {
    const myWishes = await this.wishRepository.find({
      relations: ['owner'],
      where: {
        owner: [{ id: id }],
      },
    });
    return myWishes;
  }

  async findOne(id: number): Promise<Wish> {
    return await this.wishRepository.findOne({
      where: {
        id: id,
      },
      relations: ['owner', 'offers'],
    });
  }

  async findOneId(id: number): Promise<Wish> {
    return await this.wishRepository.findOneBy({ id });
  }

  async copyWish(user: User, wish: Wish): Promise<Wish> {
    const newWish = {
      ...wish,
      id: 0,
      owner: user,
    };
    return this.wishRepository.save(newWish);
  }

  async update(oldWish: Wish, updateWish: UpdateWishDto) {
    if (oldWish.price && oldWish.raised > 0) {
      throw new ForbiddenException(
        'Вы не можете изменять стоимость подарка, если уже есть желающие скинуться',
      );
    }
    return await this.wishRepository.save({ ...oldWish, ...updateWish });
  }

  async remove(id: number) {
    return await this.wishRepository.delete({ id });
  }

  async topWishes(): Promise<Array<Wish>> {
    const options: FindManyOptions<Wish> = {
      order: { copied: 'DESC' },
      take: TOP_TAKE,
      skip: SKIP,
    };
    const [data] = await this.wishRepository.findAndCount(options);
    return data;
  }

  async lastWishes(): Promise<Array<Wish>> {
    const options: FindManyOptions<Wish> = {
      order: { createdAt: 'DESC' },
      take: LAST_TAKE,
      skip: SKIP,
    };
    const [data] = await this.wishRepository.findAndCount(options);
    return data;
  }

  async addCopied(wish: Wish): Promise<Wish> {
    const newWish = {
      ...wish,
      copied: wish.copied + 1,
    };
    return this.wishRepository.save(newWish);
  }
}
