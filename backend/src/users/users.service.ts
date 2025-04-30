import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name); // Logger instance

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        this.logger.log('Creating a new user'); // Log the start of the method
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const newUser = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        await this.cacheManager.del('all_users');
        const savedUser = await this.usersRepository.save(newUser);
        this.logger.log(`User created successfully with ID: ${savedUser.id}`); // Log success
        return savedUser;
    }

    async update(id: number, updateData: UpdateUserDto): Promise<User> {
        this.logger.log(`Updating user with ID: ${id}`); // Log the start of the method
        if (updateData.password) {
            this.logger.log('Hashing password for update'); // Log password hashing
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        await this.usersRepository.update(id, updateData);
        await this.cacheManager.del('all_users');
        await this.cacheManager.del(`user_${id}`);
        const updatedUser = await this.findOne(id);
        this.logger.log(`User with ID: ${id} updated successfully`);
        return updatedUser;
    }

    async findAll(): Promise<User[]> {
        this.logger.log('Fetching all users');
        const cached = await this.cacheManager.get<User[]>('all_users');
        if (cached) {
            this.logger.log('Returning cached users');
            return cached;
        }

        const users = await this.usersRepository.find();
        await this.cacheManager.set('all_users', users, 30);
        this.logger.log('Users fetched from database and cached');
        return users;
    }

    async findOne(id: number): Promise<User> {
        this.logger.log(`Fetching user with ID: ${id}`);
        const cachedUser = await this.cacheManager.get<User>(`user_${id}`);
        if (cachedUser) {
            this.logger.log(`Returning cached user with ID: ${id}`);
            return cachedUser;
        }

        const user = await this.usersRepository.findOneBy({ id });
        if (!user) {
            this.logger.error(`User with ID: ${id} not found`);
            throw new NotFoundException();
        }

        await this.cacheManager.set(`user_${id}`, user, 30);
        this.logger.log(`User with ID: ${id} fetched from database and cached`);
        return user;
    }

    async remove(id: number): Promise<void> {
        this.logger.log(`Removing user with ID: ${id}`);
        await this.usersRepository.delete(id);
        await this.cacheManager.del('all_users');
        await this.cacheManager.del(`user_${id}`);
        this.logger.log(`User with ID: ${id} removed successfully`);
    }
}