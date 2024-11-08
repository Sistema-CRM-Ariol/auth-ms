import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @MessagePattern('auth.register.user')
  register(@Payload() registerUserDto: RegisterUserDto){
    return this.authService.register(registerUserDto);
  }

  @MessagePattern('auth.login.user')
  login(){
    return 'login desde ms';
  }

  @MessagePattern('auth.verify.user')
  verifyToken(){
      return 'verifyToken';
  }
}
