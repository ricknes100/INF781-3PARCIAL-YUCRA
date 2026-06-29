import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  create(email: string, password: string): Promise<User> {
    return this.repo.save(this.repo.create({ email, password }));
  }
  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }
}
