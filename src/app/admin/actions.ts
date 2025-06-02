
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const ADMIN_SESSION_COOKIE = 'admin-session';

export async function login(formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error('Admin credentials are not set in environment variables.');
    return { success: false, error: 'Server configuration error.' };
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
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
