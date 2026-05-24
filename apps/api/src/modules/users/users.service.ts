import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  getMe(userId: string) {
    return this.usersRepository.findById(userId);
  }

  updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.usersRepository.updateProfile(userId, dto);
  }

  getPublicProfile(userId: string) {
    return this.usersRepository.findPublicProfile(userId);
  }
}
