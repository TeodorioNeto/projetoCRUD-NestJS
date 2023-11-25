import {
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async validarUsuario(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(username);
    if (!user) {
      throw new UnauthorizedException('Usuário ou Senha Inválidos');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      return await this.gerarToken(user);
    }

    throw new UnauthorizedException('Usuário ou Senha Inválidos');
  }

  async gerarToken(payload: User) {
    return {
      access_token: this.jwtService.sign(
        { email: payload.email },
        {
          secret: 'sua-chave',
          expiresIn: '50s',
        },
      ),
    };
  }
}
