import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/types';
import { Role } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  const adminActor = {
    sub: 1,
    role: 'ADMIN',
    username: 'admin',
    email: 'admin@assetflow.dev',
  };

  const memberActor = {
    sub: 2,
    role: 'USER',
    username: 'user',
    email: 'user@assetflow.dev',
  };

  const currentAdminTarget = {
    id: 1,
    role: 'ADMIN',
    username: 'admin',
    email: 'admin@assetflow.dev',
    phone: '+44 20 7946 0110',
    team: 'Operations',
    location: 'London',
  };

  const currentMemberTarget = {
    id: 2,
    role: 'USER',
    username: 'user',
    email: 'user@assetflow.dev',
    name: 'Elias Morgan',
    phone: '+30 21 5550 1401',
    team: 'Engineering',
    location: 'Athens',
  };

  const otherMemberTarget = {
    id: 3,
    name: 'Sofia Bennett',
    username: 'sofia.bennett',
    email: 'sofia.bennett@assetflow.dev',
    role: 'USER',
    phone: '+49 30 5557 1021',
    team: 'Product',
    location: 'Berlin',
  };

  const otherAdminTarget = {
    id: 4,
    name: 'Maya Thompson',
    username: 'maya.thomspson',
    email: 'maya.thompson@assetflow.dev',
    role: 'ADMIN',
    phone: '+44 20 7946 0110',
    team: 'Operations',
    location: 'London',
    password: '$2b$10$mockedhashedpasswordvalue',
  };

  let usersService: UsersService;
  const prismaMock = {
    user: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const requestFromAdmin = { user: adminActor } as AuthenticatedRequest;
  const requestFromMember = { user: memberActor } as AuthenticatedRequest;
  const createUserDto = {
    username: 'new.user',
    email: 'new.user@assetflow.dev',
    password: 'password123',
    name: 'New User',
    phone: '+30 21 5550 8899',
    team: 'Operations',
    location: 'Athens',
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('should not be allowed to create a user when username or email already exists', async () => {
    prismaMock.user.findFirst.mockResolvedValue(otherMemberTarget);

    const result = usersService.create(createUserDto);

    await expect(result).rejects.toThrow(ConflictException);
  });

  it('should hash the password and force the created role to user', async () => {
    type CreateUserCallPayload = {
      data: {
        username: string;
        email: string;
        password: string;
        role: Role;
        name?: string;
        phone?: string;
        team?: string;
        location?: string;
      };
      omit: {
        password: true;
      };
    };

    const { password, ...rest } = createUserDto;
    const createdSafeUser = {
      ...rest,
      role: Role.USER,
    };

    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(createdSafeUser);

    const result = await usersService.create(createUserDto);
    const createMock = prismaMock.user.create;
    const createMockCalls = createMock.mock.calls as [CreateUserCallPayload][];
    const createMockPayload = createMockCalls[0]?.[0];

    expect(createMockPayload).toBeDefined();

    if (!createMockPayload) {
      throw new Error('Expected prisma.user.create to be called');
    }

    expect(result.role).toBe(Role.USER);
    expect(createMockPayload.data.role).toBe(Role.USER);
    expect(createMockPayload.data.password).not.toBe(password);
    expect(createMockPayload.omit).toStrictEqual({
      password: true,
    });
    expect(bcrypt.compareSync(password, createMockPayload.data.password)).toBe(true);
  });

  it('should not be allowed to perform any action if user is not found', async () => {
    const notFoundId = 6;
    const updateUserDto = { team: 'changed' };
    prismaMock.user.findUnique.mockResolvedValue(null);

    const resultUpdate = usersService.update(notFoundId, updateUserDto, requestFromAdmin);
    const resultRemove = usersService.remove(notFoundId);
    const resultUpdateRole = usersService.updateRole(notFoundId, { role: 'USER' });

    await expect(resultUpdate).rejects.toThrow(NotFoundException);
    await expect(resultRemove).rejects.toThrow(NotFoundException);
    await expect(resultUpdateRole).rejects.toThrow(NotFoundException);
  });

  test('should not be allowed to remove another admin', async () => {
    prismaMock.user.findUnique.mockResolvedValue(otherAdminTarget);

    const result = usersService.remove(otherAdminTarget.id);

    await expect(result).rejects.toThrow(ForbiddenException);
  });

  test('should not be allowed to demote an admin', async () => {
    prismaMock.user.findUnique.mockResolvedValue(otherAdminTarget);

    const result = usersService.updateRole(otherAdminTarget.id, { role: Role.USER });

    await expect(result).rejects.toThrow(ForbiddenException);
  });

  test('should be allowed to remove a normal user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(otherMemberTarget);
    prismaMock.user.delete.mockResolvedValue(otherMemberTarget);

    const result = await usersService.remove(otherMemberTarget.id);

    expect(result).toStrictEqual(otherMemberTarget);
  });

  describe('Requester is an admin', () => {
    test('should not be allowed to update another admin', async () => {
      prismaMock.user.findUnique.mockResolvedValue(otherAdminTarget);
      const { id, ...rest } = otherAdminTarget;
      const updateUserDto = {
        ...rest,
        username: 'changed',
      };

      const result = usersService.update(id, updateUserDto, requestFromAdmin);

      await expect(result).rejects.toThrow(ForbiddenException);
    });

    test('should be allowed to update all of the users info', async () => {
      const updateUserDto = {
        name: 'changed',
        username: 'changed',
        email: 'changed',
        role: 'ADMIN',
        phone: 'changed',
        team: 'changed',
        location: 'changed',
      };

      prismaMock.user.findUnique.mockResolvedValue(otherMemberTarget);
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.update.mockResolvedValue({ ...updateUserDto, id: otherMemberTarget.id });

      const result = await usersService.update(
        otherMemberTarget.id,
        updateUserDto,
        requestFromAdmin,
      );

      expect(result).toStrictEqual({ ...updateUserDto, id: otherMemberTarget.id });
    });

    const existingUniqueInfoToUpdate = [
      { email: 'sofia.bennett@assetflow.dev' },
      { phone: '+49 30 5557 1021' },
      { username: 'sofia.bennett' },
    ];

    test.each(existingUniqueInfoToUpdate)(
      'should not be allowed to update unique info with an existing value',
      async (infoObj) => {
        const { id, ...rest } = currentAdminTarget;
        const updateUserDto = {
          ...rest,
          ...infoObj,
        };

        prismaMock.user.findUnique.mockResolvedValue(currentAdminTarget);
        prismaMock.user.findFirst.mockResolvedValue(otherMemberTarget);

        const resultToUpdateOwnInfo = usersService.update(id, updateUserDto, requestFromAdmin);
        await expect(resultToUpdateOwnInfo).rejects.toThrow(ConflictException);

        prismaMock.user.findUnique.mockResolvedValue(currentMemberTarget);

        const resultToUpdateAnothersInfo = usersService.update(
          otherMemberTarget.id,
          updateUserDto,
          requestFromAdmin,
        );
        await expect(resultToUpdateAnothersInfo).rejects.toThrow(ConflictException);
      },
    );
  });

  describe('Requester is a normal user', () => {
    test('should be allowed to update his own non unique info', async () => {
      const updateUserDto = {
        name: 'Changed Name',
        email: 'changed.user@assetflow.dev',
        phone: '+30 21 5550 0000',
        team: 'Operations',
        location: 'Patras',
      };
      const updatedUser = {
        ...currentMemberTarget,
        ...updateUserDto,
      };

      prismaMock.user.findUnique.mockResolvedValue(currentMemberTarget);
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const result = await usersService.update(
        currentMemberTarget.id,
        updateUserDto,
        requestFromMember,
      );

      expect(result).toStrictEqual(updatedUser);
    });

    test('should not be allowed to update his username', async () => {
      prismaMock.user.findUnique.mockResolvedValue(currentMemberTarget);
      const { id, ...rest } = currentMemberTarget;
      const updateUserDto = {
        ...rest,
        username: 'changed',
      };

      const result = usersService.update(id, updateUserDto, requestFromMember);

      await expect(result).rejects.toThrow(ForbiddenException);
    });

    test('should not be allowed to update info of another user', async () => {
      const updateUserDto = {
        name: 'changed',
        username: undefined,
        email: 'changed',
        role: 'ADMIN',
        phone: 'changed',
        team: 'changed',
        location: 'changed',
      };

      prismaMock.user.findUnique.mockResolvedValue(otherMemberTarget);

      const result = usersService.update(otherMemberTarget.id, updateUserDto, requestFromMember);

      await expect(result).rejects.toThrow(ForbiddenException);
    });

    const existingUniqueInfoToUpdate = [
      { email: 'sofia.bennett@assetflow.dev' },
      { phone: '+49 30 5557 1021' },
      { username: 'sofia.bennett' },
    ];

    test.each(existingUniqueInfoToUpdate)(
      'should not be allowed to update unique info with an existing value',
      async (infoObj) => {
        const { id, ...rest } = currentMemberTarget;
        const updateUserDto = {
          ...rest,
          ...infoObj,
          username: undefined,
        };

        prismaMock.user.findUnique.mockResolvedValue(currentMemberTarget);
        prismaMock.user.findFirst.mockResolvedValue(otherMemberTarget);

        const result = usersService.update(id, updateUserDto, requestFromMember);
        await expect(result).rejects.toThrow(ConflictException);
      },
    );
  });
});
