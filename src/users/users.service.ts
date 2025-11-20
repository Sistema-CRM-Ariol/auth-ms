import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterPaginationDto } from 'src/common/dto/filter-pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UsersService {

    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(createUserDto: CreateUserDto) {
        try {
            const user = await this.prisma.user.create({
                data: {
                    ...createUserDto,
                    password: bcrypt.hashSync(createUserDto.password, 10),
                },
            });
            const { password: _, ...rest } = user;

            return {
                user: rest,
                message: 'Usuario registrado con exito',
            }

        } catch (error) {
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                throw new RpcException({
                    statusCode: 400,
                    message: 'El correo ya esta siendo utilizado'
                })
            }
            if (error.code === 'P2002' && error.meta?.target?.includes('ci')) {
                throw new RpcException({
                    statusCode: 400,
                    message: 'El numero de documento ya esta siendo utilizado'
                })
            }

            throw new RpcException({
                statusCode: 500,
                message: 'Error al registrar el usuario',
            })
        }

    }

    async findAll(filterPaginationDto: FilterPaginationDto) {
        const { page, limit, search, isActive } = filterPaginationDto;

        const filters: any[] = [];

        if (search) {
            filters.push({
                OR: [
                    { ci: { contains: search, mode: 'insensitive' } },
                    { name: { contains: search, mode: 'insensitive' } },
                    { lastname: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            });
        }

        // Si status viene definido, lo agregamos
        if (isActive !== undefined) {
            filters.push({ isActive });
        }

        // Si existen filtros, los combinamos en un AND; de lo contrario, la consulta no tiene filtro
        const whereClause = filters.length > 0 ? { AND: filters } : {};

        // Ejecutamos la consulta de conteo y búsqueda con el mismo whereClause
        const [totalUsers, users] = await Promise.all([
            this.prisma.user.count({
                where: whereClause,
            }),
            this.prisma.user.findMany({
                take: limit,
                skip: (page! - 1) * limit!,
                orderBy: { updatedAt: 'desc' },
                where: { ...whereClause, },
                omit: {
                    password: true,
                    updatedAt: true,
                    roleId: true,
                    token: true,
                },
                include: {
                    role: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }

            }),
        ]);

        const lastPage = Math.ceil(totalUsers / limit!);

        return {
            users,
            meta: {
                page,
                lastPage,
                total: totalUsers,
            },
        };
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        try {
            const user = await this.prisma.user.update({
                where: {
                    id: id
                },
                data: updateUserDto
            });

            return {
                user,
                message: 'Usuario actualizado con exito'
            };

        } catch (error) {

            if (error.code === 'P2025') {
                throw new RpcException({
                    statusCode: 404,
                    message: 'No se encontro el usuario'
                })
            }

            throw new RpcException({
                statusCode: 500,
                message: 'Error al actualizar el usuario'
            })
        }
    }
}
