import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterPaginationDto } from 'src/common/dto/filter-pagination.dto';

@Injectable()
export class RolesService {

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(createRoleDto: CreateRoleDto) {

    const { name, summary, permissions } = createRoleDto;

    // Aplana cada módulo+array de acciones en un array de { module, action }
    const permissionCreateData = permissions.flatMap(dto =>
      dto.actions.map(action => ({
        module: dto.module,
        actions: action,              // clave singular que Prisma espera
      }))
    );

    try {
      const role = await this.prisma.role.create({
        data: {
          name,
          summary,
          permissions: {
            createMany: {
              data: permissions
            }
          }
        },
      })

      return {
        permissions,
        message: 'Rol registrado con exito',
      };
    } catch (error) {
      console.log({ error })
      throw new Error('Error al registrar el rol');
    }

  }

  async findAll(filterPaginationDto: FilterPaginationDto) {
    const { page, limit, search } = filterPaginationDto;

    const filters: any[] = [];

    if (search) {
      filters.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Si existen filtros, los combinamos en un AND; de lo contrario, la consulta no tiene filtro
    const whereClause = filters.length > 0 ? { AND: filters } : {};

    // Ejecutamos la consulta de conteo y búsqueda con el mismo whereClause
    const [totalRoles, roles] = await Promise.all([
      
      this.prisma.role.count({
        where: whereClause,
      }),

      this.prisma.role.findMany({
        take: limit,
        skip: (page! - 1) * limit!,
        orderBy: { name: 'desc' },
        where: { ...whereClause, },
        // Numero de usuarios que usan el rol
        include: {
          _count: {
            select: {
              user: true,
            }
          }
        }
      }),
    ]);

    const rolesWithCount = roles.map(role => ({
      ...role,

      usersCount: role._count.user,
    }));

    // Eliminar el campo _count de cada rol
    rolesWithCount.forEach(role => {
      delete role._count;
    });
    const lastPage = Math.ceil(totalRoles / limit!);

    return {
      roles: rolesWithCount,
      meta: {
        page,
        lastPage,
        total: totalRoles,
      },
    };
  }
}
