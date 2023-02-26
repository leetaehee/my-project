import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UserInfo } from './UserInfo';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }

    @Post()
    async createUser(@Body() dto: CreateUserDto) : Promise<void> {
        const { name, email, password} = dto;
        console.log(name + "님");
        await this.userService.createUser(name, email, password);
    }

    @Post('/email-verify')
    async verifyEmail(@Query() dto: VerifyEmailDto) : Promise<string> {
        const { signupVerifyToken } = dto;

        return await this.userService.verifyEmail(signupVerifyToken);
    }

    @Post('/login')
    async login(@Body() dto: UserLoginDto) : Promise<string> {
        const { email, password } = dto;

        return await this.userService.login(email, password);
    }

    @Get('/:id')
    async getUserUnfo(@Param('id') userId: string) : Promise<UserInfo> {
        // TODO
        // 1. userId를 가진 유저가 존재하는지 DB에서 확인하고 없다면 에러 처리
        // 2. 조회된 데이터를 UserInfo 타입으로 응답 

        throw new Error('Method not implemented.');
    }
}
