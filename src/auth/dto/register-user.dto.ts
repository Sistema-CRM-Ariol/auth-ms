import { IsOptional, IsString, IsStrongPassword } from 'class-validator'

export class RegisterUserDto {

    @IsString()
    name: string

    @IsString()
    ci: string

    @IsString()
    lastname: string
    
    @IsString()
    email: string

    @IsString()
    @IsStrongPassword()
    password: string
    
    @IsString()
    @IsOptional()
    avatar?: string


}