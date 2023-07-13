import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async create(user: User, createWishlistDto): Promise<Wishlist> {
    for (let i = 0; i < createWishlistDto.itemsId.length; i++) {
      const wish = await this.wishesService.findOne(
        createWishlistDto.itemsId[i],
      );
      const wishlists = {
        ...createWishlistDto,
        owner: user,
        items: [wish],
      };
      return await this.wishlistRepository.save(wishlists);
    }
  }

  async findAll() {
    return await this.wishlistRepository.find();
  }

  async findOne(id: number): Promise<Wishlist> {
    return await this.wishlistRepository.findOne({
      where: {
        id: id,
      },
      relations: ['owner', 'items'],
    });
  }

  async update(
    idUser: number,
    id: number,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishlists = await this.findOne(id);
    if (wishlists.owner.id === idUser) {
      return this.wishlistRepository.update({ id }, updateWishlistDto);
    } else {
      throw new UnauthorizedException(
        'Вы не можете редактировать чужие списки подарков',
      );
    }
  }

  async remove(idUser: number, id: number) {
    const wishlists = await this.findOne(id);
    if (wishlists.owner.id === idUser) {
      return await this.wishlistRepository.delete({ id });
    } else {
      throw new UnauthorizedException(
        'Вы не можете удалять чужие списки подарков',
      );
    }
  }
}
