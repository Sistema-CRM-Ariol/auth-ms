import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @MessagePattern('auth.register.user')
  register(@Payload() registerUserDto: RegisterUserDto){
    return this.authService.register(registerUserDto);
  }

  @MessagePattern('auth.login.user')
  login(@Payload() loginUserDto: LoginUserDto){
    return this.authService.login(loginUserDto);
  }

  @MessagePattern('auth.verify.user')
  verifyToken(){
      return 'verifyToken';
  }
}
