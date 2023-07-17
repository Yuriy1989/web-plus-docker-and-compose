import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwtAuth.guard';
import { WishesService } from '../wishes/wishes.service';

@ApiTags('Offers')
@Controller('offers')
@UseGuards(JwtGuard)
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly wishesService: WishesService,
  ) {}

  @Post()
  async create(@Req() req, @Body() body) {
    const { amount, itemId } = body;
    const wish = await this.wishesService.findOne(itemId);
    let offers;

    if (wish.price > amount && wish.price > wish.raised + amount) {
      offers = await this.offersService.create(req.user, wish, {
        amount: Math.floor(+amount * 100) / 100,
      });
      const updateWish = {
        ...wish,
        raised: wish.raised + amount,
        ownerId: offers,
      };
      await this.wishesService.update(wish, updateWish);
      return offers;
    } else {
      throw new BadRequestException(
        'Сумма вложения превышает стоимость подарка',
      );
    }
  }

  @Get()
  findAll() {
    return this.offersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOfferDto: UpdateOfferDto) {
    return this.offersService.update(+id, updateOfferDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offersService.remove(+id);
  }
}
