import { IsArray, IsOptional, IsString, IsStrongPassword, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class PermissionDto {
    @IsString()
    module: string;

    @IsArray()
    @IsIn(['create', 'read', 'update', 'remove', 'report'], { each: true })
    actions: ('create' | 'read' | 'update' | 'remove' | 'report')[];
}

export class RegisterUserDto {
    @IsString()
    name: string;

    @IsString()
    ci: string;

    @IsString()
    lastname: string;
    
    @IsString()
    email: string;

    @IsString()
    @IsStrongPassword()
    password: string;
    
    @IsString()
    @IsOptional()
    avatar?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissionDto)
    permissions: PermissionDto[];
}