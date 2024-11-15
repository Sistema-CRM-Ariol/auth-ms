import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async register(registerUserDto: RegisterUserDto) {

        const { permissions, password, ...newUser } = registerUserDto;
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
                    ...newUser,
                    password: bcrypt.hashSync(password, 10),
                    permissions: {
                        create: permissions,
                    },
                    avatar: null,
                    // TODO: Hash de la contraseña
                },
                include: {
                    permissions: {
                        select: {
                            module: true,
                            actions: true
                        }
                    },
                }
            });
    
            const { password: _, ...rest } = user; 

            return {
                rest,
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
