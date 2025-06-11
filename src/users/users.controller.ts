import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterPaginationDto } from 'src/common/dto/filter-pagination.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('createUser')
  create(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern('findAllUsers')
  findAll(@Payload() filterPaginationDto: FilterPaginationDto) {
    return this.usersService.findAll(filterPaginationDto);
  }

  @MessagePattern('updateUser')
  update(@Payload() payload: {id: string, updateUserDto: UpdateUserDto}) {
    return this.usersService.update(payload.id, payload.updateUserDto);
  }
}
