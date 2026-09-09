import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '../../generated/prisma/client';
import { AppError } from '../../utils/AppError';

import prisma from '../../utils/prisma';

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET || 'secret', {
    expiresIn: '60m',
  });

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: '7d' },
  );

  return { accessToken, refreshToken };
};

export const registerService = async (data: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError(400, 'User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: Role.PATIENT, // Default role for public signup
    },
  });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const loginService = async (data: any) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    throw new AppError(401, 'Invalid email or password');
  }

  const tokens = generateTokens(user.id, user.role);

  // Store refresh token in DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    ...tokens,
  };
};

export const refreshTokenService = async (token: string) => {
  const existingToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!existingToken || existingToken.expiresAt < new Date()) {
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret') as any;
  } catch (err) {
    throw new AppError(401, 'Invalid refresh token signature');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    throw new AppError(401, 'User no longer exists');
  }

  const tokens = generateTokens(user.id, user.role);

  // Rotate token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.update({
    where: { id: existingToken.id },
    data: {
      token: tokens.refreshToken,
      expiresAt,
    },
  });

  return tokens;
};

export const logoutService = async (token: string) => {
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
};
