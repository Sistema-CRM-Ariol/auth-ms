import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async register(registerUserDto: RegisterUserDto) {

        try {
            
            const userExists = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { ci: registerUserDto.ci },
                        { email: registerUserDto.email },
                    ]
                }
            })
    
            if (userExists) {
                throw new RpcException({
                    message: "Ya se registro un usuario con este correo",
                    status: HttpStatus.BAD_REQUEST
                });
            }
    
    
            const user = await this.prisma.user.create({
                data: {
                    ...registerUserDto,
                    avatar: null,
                    roles: {
                        
                    }
                    // TODO: Hash de la contraseña
                }
            });
    
            return {
                user,
                message: "Usuario registrado con exito"
            };
        } catch (error) {
            throw new RpcException({
                status: HttpStatus.BAD_REQUEST,
                message: error.message
            });
        }
    }

}
