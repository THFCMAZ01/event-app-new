import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt.utils';
import { sendWelcomeEmail } from '../services/email.service';

const prisma = new PrismaClient();

export async function signup({ body, set }: { body: any, set: any }) {
  const { email, password, role } = body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      set.status = 409;
      return { error: 'Email already in use' };
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash, role: role || 'ATTENDEE' },
    });
    await sendWelcomeEmail(email);
    set.status = 201;
    return { message: 'User created', userId: user.id };
  } catch (e) {
    console.error('Signup error:', e);
    set.status = 500;
    return { error: 'Server error during signup' };
  }
}

export async function login({ body, set }: { body: any, set: any }) {
  const { email, password } = body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      set.status = 401;
      return { error: 'User not found' };
    }
    if (!(await bcrypt.compare(password, user.password))) {
      set.status = 401;
      return { error: 'Invalid password' };
    }
    const token = signToken({ id: user.id, role: user.role });
    return { token };
  } catch (e) {
    console.error('Login error:', e);
    set.status = 500;
    return { error: 'Server error during login' };
  }
}
