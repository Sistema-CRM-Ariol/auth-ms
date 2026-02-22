import { PrismaClient, Action } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Eliminar en orden correcto para respetar las FK:
    // 1. Usuarios (referencian roles)
    // 2. Roles (referencian permisos vía join table)
    // 3. Permisos
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();

    // Definición reutilizable de acciones por módulo
    const allActions       = [Action.view, Action.create, Action.read, Action.readOne, Action.update, Action.delete, Action.report];
    const crudActions      = [Action.view, Action.create, Action.read, Action.readOne, Action.update, Action.delete];
    const crudReportActions = allActions;

    // Crear roles con sus permisos propios (cada rol tiene sus propios registros de Permission)
    const createRolesTransaction = await prisma.$transaction(async (tx) => {

        const adminRole = await tx.role.create({
            data: {
                name: 'Super Admin',
                summary: 'Administrador del sistema y soporte técnico',
                permissions: {
                    create: [
                        { module: 'users',              actions: crudActions },
                        { module: 'products',           actions: crudActions },
                        { module: 'categories',         actions: crudActions },
                        { module: 'brands',             actions: crudActions },
                        { module: 'clients',            actions: crudActions },
                        { module: 'leads',              actions: crudActions },
                        { module: 'providers',          actions: crudReportActions },
                        { module: 'providersCompanies', actions: crudReportActions },
                        { module: 'warehouses',         actions: crudReportActions },
                        { module: 'inventories',        actions: crudReportActions },
                        { module: 'roles',              actions: crudActions },
                        { module: 'quotations',         actions: crudReportActions },
                        { module: 'sales',              actions: crudReportActions },
                        { module: 'imports',            actions: crudReportActions },
                    ],
                },
            },
        });

        const salesRole = await tx.role.create({
            data: {
                name: 'Sales',
                summary: 'Encargado de gestionar ventas y cotizaciones',
                permissions: {
                    create: [
                        { module: 'clients',    actions: crudActions },
                        { module: 'quotations', actions: crudReportActions },
                        { module: 'sales',      actions: crudReportActions },
                    ],
                },
            },
        });

        const inventoryRole = await tx.role.create({
            data: {
                name: 'Inventory Manager',
                summary: 'Responsable de la gestión de inventarios y almacenes',
                permissions: {
                    create: [
                        { module: 'products',    actions: crudActions },
                        { module: 'warehouses',  actions: crudReportActions },
                        { module: 'inventories', actions: crudReportActions },
                    ],
                },
            },
        });

        const clientServiceRole = await tx.role.create({
            data: {
                name: 'Customer Service',
                summary: 'Atención al cliente y soporte postventa',
                permissions: {
                    create: [
                        { module: 'clients', actions: crudActions },
                        { module: 'leads',   actions: crudActions },
                    ],
                },
            },
        });

        return { adminRole, salesRole, inventoryRole, clientServiceRole };
    });

    const { adminRole, salesRole, inventoryRole, clientServiceRole } = createRolesTransaction;

    // Crear usuarios
    await prisma.user.createMany({
        data: [
            {
                email: 'admin@correo.com',
                password: await bcrypt.hash('admin123', 10),
                name: 'Admin',
                lastname: 'User',
                roleId: adminRole.id,
                ci: '123456789',
            },
            {
                email: 'sales@correo.com',
                password: await bcrypt.hash('sales123', 10),
                name: 'Sales',
                lastname: 'User',
                roleId: salesRole.id,
                ci: '987654321',
            },
            {
                email: 'inventory@correo.com',
                password: await bcrypt.hash('inventory123', 10),
                name: 'Inventory',
                lastname: 'Manager',
                roleId: inventoryRole.id,
                ci: '456789123',
            },
            {
                email: 'cliente@correo.com',
                password: await bcrypt.hash('cliente123', 10),
                name: 'Customer',
                lastname: 'Service',
                roleId: clientServiceRole.id,
                ci: '321654987',
            },
        ],
    });


    console.log('✅ Roles y permisos creados:', {
        adminRole,
        salesRole,
        inventoryRole,
        clientServiceRole
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