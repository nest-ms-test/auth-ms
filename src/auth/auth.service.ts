import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, RegisterUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwtService: JwtService) {
    super();
  }

  async onModuleInit() {
    this.$connect();
    this.logger.log('Connected to mongo database');
  }

  signJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  verifyJwtToken(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.JWT_SECRET,
      });

      return {
        user,
        token: this.signJwtToken(user),
      };
    } catch (error) {
      throw new RpcException({
        status: 401,
        message: 'Invalid token',
      });
    }
  }

  async resgisterUser(registerUserDto: RegisterUserDto) {
    const { name, email, password } = registerUserDto;

    try {
      const user = await this.user.findUnique({
        where: { email },
      });

      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      const newUser = await this.user.create({
        data: {
          name,
          email,
          password: await bcrypt.hash(password, 10),
        },
      });

      delete newUser['password'];

      return {
        user: newUser,
        token: this.signJwtToken(newUser),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      const user = await this.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'User or password not valid',
        });
      }

      const validPassword = bcrypt.compareSync(password, user.password);

      if (!validPassword) {
        throw new RpcException({
          status: 400,
          message: 'User or password not valid',
        });
      }

      delete user['password'];

      return {
        user,
        token: this.signJwtToken(user),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
}
