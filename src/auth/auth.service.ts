import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

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

                    avatar: null,
                },
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
                where: { email },
                include: {
                    role: {
                        include: {
                            permissions: true,
                        }
                    }
                }
            })

            if (!user) {
                throw new RpcException({
                    message: "Credenciales incorrectas",
                    status: HttpStatus.BAD_REQUEST
                });
            }

            const isPasswordValid = bcrypt.compareSync(password, user.password);

            if (!isPasswordValid) {
                throw new RpcException({
                    message: "Contraseña incorrecta",
                    status: HttpStatus.UNAUTHORIZED,
                })
            }

            // Construir permisos en formato module:action
            const permissions = this.buildPermissions(user.role?.permissions || []);

            // Generar JWT
            const payload: JwtPayload = {
                sub: user.id,
                email: user.email,
                role: user.role?.name || null,
                permissions,
            };

            const token = this.jwtService.sign(payload);

            // Opcional: Guardar token en BD para logout
            await this.prisma.user.update({
                where: { id: user.id },
                data: { token },
            });

            const { password: _, token: jwtToken, role, ...userWithoutPassword } = user;

            return {
                user: {
                    ...userWithoutPassword,
                    permissions,
                },
                token,
            };

        } catch (error) {
            throw new RpcException({
                status: HttpStatus.BAD_REQUEST,
                message: error.message
            });
        }
    }

    async logout(userId: string) {
        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: { token: null },
            });

            return { message: 'Logout exitoso' };
        } catch (error) {
            throw new RpcException({
                statusCode: 500,
                message: 'Error al cerrar sesión',
            });
        }
    }

    async signJWT(payload: JwtPayload) {
        return this.jwtService.sign(payload)
    }

    async verifyToken(token: string) {
        try {
            const payload = this.jwtService.verify(token);

            // Verificar que el usuario sigue activo y el token es válido
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub, isActive: true },
                include: {
                    role: {
                        include: {
                            permissions: true,
                        },
                    },
                },
            });

            if (!user || user.token !== token) {
                throw new RpcException({
                    statusCode: 401,
                    message: 'Token inválido',
                });
            }

            const { password: _, token: __, role, ...userWithoutSensitiveData } = user;

            return {
                user: {
                    ...userWithoutSensitiveData,
                    permissions: this.buildPermissions(user.role?.permissions || []),
                },
                token,
            };
        } catch (error) {
            throw new RpcException({
                statusCode: 401,
                message: 'Token inválido o expirado',
            });
        }
    }

    // Helper para construir permisos en formato "module:action"
    private buildPermissions(permissions: any[]): string[] {
        const permissionsArray: string[] = [];

        permissions.forEach((permission) => {
            permission.actions.forEach((action: string) => {
                permissionsArray.push(`${permission.module}:${action}`);
            });
        });

        return permissionsArray;
    }

}
