import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private readonly jwtService: JwtService, 
    ) { }

    async register(registerUserDto: RegisterUserDto) {
        const { permissions, password, ...newUser } = registerUserDto;
        try {
            
            const userExists = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { ci: newUser.ci },
                        { email: newUser.email },
                    ]
                }
            })

            if (userExists && userExists.ci === newUser.ci) {
                throw new RpcException({
                    message: "Ya se registro un usuario con este CI",
                    status: HttpStatus.BAD_REQUEST
                });
            }
            
            if (userExists && userExists.email === newUser.email) {
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
                user: rest,
                message: "Usuario registrado con exito"
            };

        } catch (error) {
            console.log(error)
            throw new RpcException({
                status: HttpStatus.BAD_REQUEST,
                message: error.message
            });
        }
    }

    async login(loginUserDto: LoginUserDto) {

        const { email, password } = loginUserDto;
        try {
            
            const user = await this.prisma.user.findFirst({
                where: { email }
            })
    
            if ( !user ) {
                throw new RpcException({
                    message: "Credenciales incorrectas",
                    status: HttpStatus.BAD_REQUEST
                });
            }
            
            const isPasswordValid = bcrypt.compareSync(password, user.password);
    
            if( !isPasswordValid ){
                throw new RpcException({
                    message: "Contraseña incorrecta",
                    status: HttpStatus.UNAUTHORIZED,
                })
            }

            const { password: _, ...rest } = user; 

            return {
                user: rest,
                token: await this.signJWT({id: rest.id, name: rest.name, email: rest.email})
            };

        } catch (error) {
            throw new RpcException({
                status: HttpStatus.BAD_REQUEST,
                message: error.message
            });
        }
    }


    async signJWT( payload: JwtPayload ){
        return this.jwtService.sign(payload)
    }

    async verifyToken(token: string){
        try {
            const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
                secret: envs.jwtSecret,
            })

            return {
                user,
                token: token,
            }

        } catch (error) {
            console.log(error)
            throw new RpcException({
                status: HttpStatus.UNAUTHORIZED,
                message: "Token invalido"
            })
        }
    }

}
