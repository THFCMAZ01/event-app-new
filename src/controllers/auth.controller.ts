import bcrypt from 'bcrypt';
import { prisma } from '../prisma/client';
import { sendWelcomeEmail } from '../services/email.service';
import { signToken } from '../utils/jwt.utils';

export async function signup({ body, set }: { body: any; set: any }) {
  const { email, password } = body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      set.status = 409;
      return { error: 'Email already in use' };
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        role: 'ATTENDEE',
      },
    });

    // An email delivery failure should not turn a successful account creation
    // into a misleading 500 response after the user has already been persisted.
    try {
      await sendWelcomeEmail(email);
    } catch (emailError) {
      console.error('Welcome email could not be sent:', emailError);
    }

    set.status = 201;
    return { message: 'User created', userId: user.id };
  } catch (error) {
    console.error('Signup error:', error);
    set.status = 500;
    return { error: 'Server error during signup' };
  }
}

export async function login({ body, set }: { body: any; set: any }) {
  const { email, password } = body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      set.status = 401;
      return { error: 'Invalid email or password' };
    }

    const token = signToken({ id: user.id, role: user.role });
    return { token };
  } catch (error) {
    console.error('Login error:', error);
    set.status = 500;
    return { error: 'Server error during login' };
  }
}
