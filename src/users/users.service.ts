import { Injectable,ConflictException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>, 
  ){}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      // Se o e-mail já estiver em uso, lançar uma exceção de conflito
      throw new ConflictException('E-mail já está em uso');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(newUser);
  }

  findAll() {
    return this.userRepository.find();
  }
  
  findOne(id: number) {
    return this.userRepository.findOneBy({ id: id });
  }
  async findOneByEmail(username: string) {
    return await this.userRepository.findOneBy({ email: username });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id,updateUserDto);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }
}
