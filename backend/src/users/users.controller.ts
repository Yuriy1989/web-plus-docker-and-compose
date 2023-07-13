import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtGuard } from 'src/auth/guards/jwtAuth.guard';
import { WishesService } from 'src/wishes/wishes.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('me')
  async findMe(@Req() req): Promise<User> {
    return await this.usersService.findMy({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        about: true,
        avatar: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Patch('me')
  updateMe(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('me/wishes')
  getMeWishes(@Req() req) {
    return this.wishesService.findAllMyWishes(+req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get(':username')
  findOneUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('find')
  findMany(@Body() body) {
    const { query } = body;
    return this.usersService.findMany(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get(':id/wishes')
  getMyWishesSearch(@Req() req) {
    return this.wishesService.findAllMyWishes(+req.user.id);
  }
}
