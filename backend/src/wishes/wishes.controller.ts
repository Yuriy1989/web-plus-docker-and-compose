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
  UnauthorizedException,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwtAuth.guard';

@ApiTags('Wishes')
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Req() req, @Body() createWishDto: CreateWishDto) {
    return this.wishesService.create(req.user, createWishDto);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll() {
    return this.wishesService.findAll();
  }

  @Get('top')
  topWishes() {
    return this.wishesService.topWishes();
  }

  @Get('last')
  lastWishes() {
    return this.wishesService.lastWishes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wishesService.findOne(+id);
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  async copyWish(@Req() req, @Param('id') id: string) {
    const wish = await this.wishesService.findOne(+id);
    const newWish = await this.wishesService.copyWish(req.user, wish);
    if (newWish) {
      const allWish = await this.wishesService.findAll();
      for (let i = 0; i < allWish.length; i++) {
        await this.wishesService.addCopied(allWish[i]);
      }
    }
    return newWish;
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    const oldWish = await this.wishesService.findOne(+id);
    let newWish;
    if (oldWish && oldWish.owner.id === Number(req.user.id)) {
      newWish = await this.wishesService.update(oldWish, updateWishDto);
      return newWish;
    } else {
      throw new UnauthorizedException(
        'Ошибка обновления информации о подарке!!!',
      );
    }
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const wish = await this.wishesService.findOne(+id);
    if (wish && wish.owner.id === Number(req.user.id)) {
      await this.wishesService.remove(+id);
      return { message: 'Подарок удален' };
    } else {
      throw new UnauthorizedException('Ошибка удаления!!!');
    }
  }
}
