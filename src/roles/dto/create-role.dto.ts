
import { Action } from '@prisma/client'
import { Type } from 'class-transformer'
import {
    IsString,
    IsArray,
    ValidateNested,
    ArrayNotEmpty,
    ArrayMinSize,
} from 'class-validator'

// enum Action {
//     'create' = 'create',
//     'read' = 'read',
//     'read-one' = 'read-one',
//     'update' = 'update',
//     'delete' = 'delete',
//     'report' = 'report',
//     'report-one' = 'report-one',
// }
export class PermissionDto {
    @IsString()
    module: string

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    actions: Action[]
}

export class CreateRoleDto {
    @IsString()
    name: string

    @IsString()
    summary: string

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => PermissionDto)
    permissions: PermissionDto[]
}
