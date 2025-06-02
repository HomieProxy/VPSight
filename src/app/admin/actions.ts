
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE } from '@/lib/constants';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { success: false, error: 'Username and password are required.' };
  }

  try {
    const adminUser: { id: number; username: string; password_hash: string } | undefined = db
      .prepare('SELECT id, username, password_hash FROM admins WHERE username = ?')
      .get(username);

    if (!adminUser) {
      return { success: false, error: 'Invalid username or password.' };
    }

    const passwordMatch = await bcrypt.compare(password, adminUser.password_hash);

    if (passwordMatch) {
      cookies().set(ADMIN_SESSION_COOKIE, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
        sameSite: 'lax',
      });
      return { success: true };
    } else {
      return { success: false, error: 'Invalid username or password.' };
    }
  } catch (error) {
    console.error('Database error during login:', error);
    // In a real app, you might want to log this error more robustly
    // For now, return a generic error to the user
    return { success: false, error: 'An internal server error occurred. Please try again later.' };
  }
}

export async function logout() {
  cookies().delete(ADMIN_SESSION_COOKIE);
  redirect('/admin/login');
}

export async function getAdminSession() {
  const cookieStore = cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE);
  return session?.value === 'true';
}
