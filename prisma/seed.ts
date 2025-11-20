import { PrismaClient, Action } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Crear permisos para diferentes módulos
    const usersPermissions = await prisma.permission.create({
        data: {
            module: 'users',
            actions: [Action.view, Action.create, Action.read, Action.update, Action.delete, Action.readOne],
        },
    });

    const productsPermissions = await prisma.permission.create({
        data: {
            module: 'products',
            actions: [Action.view, Action.create, Action.read, Action.update, Action.delete, Action.readOne, Action.readOne],
        },
    });

    const categoriesPermissions = await prisma.permission.create({
        data: {
            module: 'categories',
            actions: [Action.view, Action.create, Action.read, Action.readOne, Action.update, Action.delete, Action.readOne],
        },
    });

    const brandsPermissions = await prisma.permission.create({
        data: {
            module: 'brands',
            actions: [Action.view, Action.create, Action.read, Action.readOne, Action.update, Action.delete, Action.readOne],
        },
    });

    const clientsPermissions = await prisma.permission.create({
        data: {
            module: 'clients',
            actions: [Action.view, Action.create, Action.read, Action.readOne, Action.update, Action.delete, Action.readOne],
        },
    });

    const providersPermissions = await prisma.permission.create({
        data: {
            module: 'providers',
            actions: [Action.view, Action.create, Action.read, Action.readOne, Action.update, Action.delete, Action.report],
        },
    });

    const providersCompaniesPermissions = await prisma.permission.create({
        data: {
            module: 'providersCompanies',
            actions: [Action.view, Action.create, Action.read, Action.readOne, Action.update, Action.delete, Action.report],
        },
    });

    const warehousesPermissions = await prisma.permission.create({
        data: {
            module: 'warehouses',
            actions: [Action.view, Action.create, Action.read, Action.readOne, Action.update, Action.delete, Action.report],
        },
    });

    // Crear rol Admin (todos los permisos)
    const adminRole = await prisma.role.create({
        data: {
            name: 'Super Admin',
            summary: 'Administrador del sistema y soporte técnico',
            permissions: {
                connect: [
                    { id: categoriesPermissions.id },
                    { id: brandsPermissions.id },
                    { id: clientsPermissions.id },
                    { id: usersPermissions.id },
                    { id: productsPermissions.id },
                    { id: warehousesPermissions.id },
                    { id: providersPermissions.id },
                    { id: providersCompaniesPermissions.id },
                ],
            },
        },
    });

    // Crear usuario Admin
    await prisma.user.delete({
        where: { email: 'admin@correo.com' },
    }).catch(() => {
        // Ignorar si el usuario no existe
    })

    await prisma.user.create({
        data: {
            email: 'admin@correo.com',
            password: await bcrypt.hash('admin123', 10),
            name: 'Admin',
            lastname: 'User',
            roleId: adminRole.id,
            ci: '123456789',
        }
    })


    console.log('✅ Roles y permisos creados:', {
        adminRole,
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });