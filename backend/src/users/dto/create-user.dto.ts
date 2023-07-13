import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 30)
  @IsNotEmpty()
  @ApiProperty({ example: 'example_user' })
  username: string;

  @IsString()
  @IsOptional()
  @Length(2, 200)
  @ApiProperty({ example: 'about us user' })
  about: string;

  @IsUrl()
  @IsOptional()
  @ApiPropertyOptional({
    example:
      'https://bipbap.ru/wp-content/uploads/2022/11/1652235714_41-kartinkin-net-p-prikolnie-kartinki-dlya-stima-44.jpg',
  })
  avatar?: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'user@mail.ru' })
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  @ApiProperty({ example: '123456' })
  password: string;
}
