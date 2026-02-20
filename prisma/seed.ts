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

    const inventoriesPermissions = await prisma.permission.create({
        data: {
            module: 'inventories',
            actions: [Action.view, Action.create, Action.read, Action.readOne, Action.update, Action.delete, Action.report],
        },
    });

    const rolesPermissions = await prisma.permission.create({
        data: {
            module: 'roles',
            actions: [Action.view, Action.create, Action.read, Action.readOne, Action.update, Action.delete],
        },
    });

    const quotationsPermissions = await prisma.permission.create({
        data: {
            module: 'quotations',
            actions: [Action.view, Action.create, Action.read, Action.readOne, Action.update, Action.delete, Action.report],
        },
    });

    const salesPermissions = await prisma.permission.create({
        data: {
            module: 'sales',
            actions: [Action.view, Action.create, Action.read, Action.readOne, Action.update, Action.delete, Action.report],
        },
    });

    const importsPermissions = await prisma.permission.create({
        data: {
            module: 'imports',
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
                    { id: inventoriesPermissions.id },
                    { id: rolesPermissions.id },
                    { id: quotationsPermissions.id },
                    { id: salesPermissions.id },
                    { id: importsPermissions.id },
                ],
            },
        },
    });

    const salesRole = await prisma.role.create({
        data: {
            name: 'Sales',
            summary: 'Encargado de ventas y cotizaciones',
            permissions: {
                connect: [
                    { id: clientsPermissions.id },
                    { id: productsPermissions.id },
                    { id: salesPermissions.id },
                    { id: quotationsPermissions.id },
                ],
            },
        },
    });

    const inventoryRole = await prisma.role.create({
        data: {
            name: 'Inventory Manager',
            summary: 'Encargado de gestión de inventarios y almacenes',
            permissions: {
                connect: [
                    { id: productsPermissions.id },
                    { id: warehousesPermissions.id },
                    { id: inventoriesPermissions.id },
                    { id: importsPermissions.id },
                ],
            },
        },
    });

    const clientServiceRole = await prisma.role.create({
        data: {
            name: 'Customer Service',
            summary: 'Encargado de atención al cliente y soporte',
            permissions: {
                connect: [
                    { id: clientsPermissions.id },
                    { id: salesPermissions.id },
                    { id: quotationsPermissions.id },
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

    // Crear usuario Sales
    await prisma.user.delete({
        where: { email: 'sales@correo.com' },
    }).catch(() => {
        // Ignorar si el usuario no existe
    })

    await prisma.user.create({
        data: {
            email: 'sales@correo.com',
            password: await bcrypt.hash('sales123', 10),
            name: 'Sales',
            lastname: 'User',
            roleId: salesRole.id,
            ci: '987654321',
        }
    })

    // Crear usuario Inventory Manager
    await prisma.user.delete({
        where: { email: 'inventory@correo.com' },
    }).catch(() => {
        // Ignorar si el usuario no existe
    })

    await prisma.user.create({
        data: {
            email: 'inventory@correo.com',
            password: await bcrypt.hash('inventory123', 10),
            name: 'Inventory',
            lastname: 'Manager',
            roleId: inventoryRole.id,
            ci: '456789123',
        }
    })

    // Crear usuario Customer Service
    await prisma.user.delete({
        where: { email: 'cliente@correo.com' },
    }).catch(() => {
        // Ignorar si el usuario no existe
    })

    await prisma.user.create({
        data: {
            email: 'cliente@correo.com',
            password: await bcrypt.hash('cliente123', 10),
            name: 'Customer',
            lastname: 'Service',
            roleId: clientServiceRole.id,
            ci: '321654987',
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