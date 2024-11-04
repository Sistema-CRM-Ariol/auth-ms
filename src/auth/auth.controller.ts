import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @MessagePattern('auth.register.user')
  register(){
    console.log('Hola')
    return 'register';
  }

  @MessagePattern('auth.login.user')
  login(){
    return 'login';
  }

  @MessagePattern('auth.verify.user')
  verifyToken(){
      return 'verifyToken';
  }
}
