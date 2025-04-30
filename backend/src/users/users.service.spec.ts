import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', password: 'hashedPassword' } as User;
const mockUsers = [mockUser];

const mockUsersRepository = {
  create: jest.fn().mockReturnValue(mockUser),
  save: jest.fn().mockResolvedValue(mockUser),
  update: jest.fn().mockResolvedValue(undefined),
  find: jest.fn().mockResolvedValue(mockUsers),
  findOneBy: jest.fn().mockResolvedValue(mockUser),
  delete: jest.fn().mockResolvedValue(undefined),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashedPassword');
      const createUserDto = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
      const result = await service.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(usersRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedPassword',
      });
      expect(usersRepository.save).toHaveBeenCalledWith(mockUser);
      expect(cacheManager.del).toHaveBeenCalledWith('all_users');
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashedPassword');
      const updateUserDto = { name: 'Updated Name', password: 'newPassword' };
      const result = await service.update(1, updateUserDto);
      expect(result).toEqual(mockUser);
      expect(usersRepository.update).toHaveBeenCalledWith(1, { ...updateUserDto, password: 'hashedPassword' });
      expect(cacheManager.del).toHaveBeenCalledWith('all_users');
      expect(cacheManager.del).toHaveBeenCalledWith('user_1');
    });
  });

  describe('findAll', () => {
    it('should return all users from cache if available', async () => {
      mockCacheManager.get.mockResolvedValue(mockUsers);
      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
      expect(cacheManager.get).toHaveBeenCalledWith('all_users');
      expect(usersRepository.find).not.toHaveBeenCalled();
    });

    it('should return all users from database if not cached', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
      expect(usersRepository.find).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith('all_users', mockUsers, 30);
    });
  });

  describe('findOne', () => {

    it('should return a user from database if not cached', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(cacheManager.set).toHaveBeenCalledWith('user_1', mockUser, 30);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user and clear cache', async () => {
      const result = await service.remove(1);
      expect(result).toBeUndefined();
      expect(usersRepository.delete).toHaveBeenCalledWith(1);
      expect(cacheManager.del).toHaveBeenCalledWith('all_users');
      expect(cacheManager.del).toHaveBeenCalledWith('user_1');
    });
  });
});
