import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { LoginDto, RegisterDto } from './auth.controller';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService, 
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,      
    ){}

    async register(registerDto: RegisterDto){
        const user = await this.usersService.create(registerDto);
        const token = await this.jwtService.signAsync({
            user_id: user.id,
            role: user.role.name,
        });
        return { token }; 
    }

    async login(loginDto: LoginDto){
        const user = await this.prismaService.user.findFirst({
            where: {
                OR: [
                    {
                        email: loginDto.username,
                    },
                    {
                        mobile: loginDto.username,
                    },
                ],
            },
            include: { role: { select: { name: true } } }
        });
        if (!user) {
            throw new NotFoundException(`User ${loginDto.username} not found`);
        }

        if (!(await compare(loginDto.password,  user.password))){
            throw new UnauthorizedException('Invalid Credentials');
        }

        const token = await this.jwtService.signAsync({
            user_id: user.id,
            role: user.role.name,
        });
        return { token };
    }
}
