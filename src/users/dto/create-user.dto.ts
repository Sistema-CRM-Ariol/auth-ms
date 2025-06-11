import { Prisma } from "@prisma/client";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateUserDto implements Prisma.UserCreateInput {
    @IsString()
    ci: string;

    @IsString()
    lastname: string;
    
    @IsString()
    @IsOptional()
    avatar?: string;
    
    @IsString()
    name: string;
    
    @IsString()
    email: string;
    
    @IsString()
    password: string;
    
    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsString()
    @IsOptional()
    roleId: string;
}
