import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth.register.user' })
  resgisterUser(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.resgisterUser(registerUserDto);
  }

  @MessagePattern({ cmd: 'auth.login.user' })
  loginUser(@Payload() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @MessagePattern({ cmd: 'auth.verify.user' })
  verifyToken(@Payload() token: string) {
    return this.authService.verifyJwtToken(token);
  }
}
