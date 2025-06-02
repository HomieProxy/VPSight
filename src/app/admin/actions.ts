
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE } from '@/lib/constants';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Zod schema for AddVpsInstance form validation
export const AddVpsInstanceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  group_name: z.string().optional(),
  ip_address: z.string().ip({ version: 'ipv4', message: 'Invalid IP address' }).optional().or(z.literal('')),
  country_region: z.string().optional(),
  // agent_version is not part of the form, set by agent
  // secret is generated
  // install_command is generated
  note_billing_start_date: z.string().optional(),
  note_billing_end_date: z.string().optional(),
  note_billing_cycle: z.string().optional(),
  note_billing_amount: z.string().optional(),
  note_plan_bandwidth: z.string().optional(),
  note_plan_traffic_type: z.coerce.number().min(0).max(2).optional(), // 0, 1, 2
});

export type AddVpsInstanceInput = z.infer<typeof AddVpsInstanceSchema>;

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

export async function login(formData: FormData): Promise<ActionResult> {
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

export async function addVpsInstance(input: AddVpsInstanceInput): Promise<ActionResult> {
  try {
    const validation = AddVpsInstanceSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }

    const {
      name,
      type,
      group_name,
      ip_address,
      country_region,
      note_billing_start_date,
      note_billing_end_date,
      note_billing_cycle,
      note_billing_amount,
      note_plan_bandwidth,
      note_plan_traffic_type
    } = validation.data;

    // Generate secret (16 hex characters)
    const secret = crypto.randomBytes(8).toString('hex').toUpperCase();
    
    // Construct install command (replace YOUR_APP_URL with actual URL or make it configurable)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'; // Example, ensure this is set
    const install_command = `curl -sSL ${appUrl}/install_agent.sh | sudo bash -s ${secret}`;

    const result = db.prepare(
      `INSERT INTO vps_instances (
        name, type, group_name, ip_address, country_region, secret, install_command,
        note_billing_start_date, note_billing_end_date, note_billing_cycle, note_billing_amount,
        note_plan_bandwidth, note_plan_traffic_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      name, type || null, group_name || null, ip_address || null, country_region || null, secret, install_command,
      note_billing_start_date || null, note_billing_end_date || null, note_billing_cycle || null, note_billing_amount || null,
      note_plan_bandwidth || null, note_plan_traffic_type !== undefined ? note_plan_traffic_type : null
    );

    revalidatePath('/admin/dashboard');
    return { success: true, data: { id: result.lastInsertRowid } };

  } catch (error: any) {
    console.error('Error adding VPS instance:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return { success: false, error: 'A VPS with this secret already exists (collision detected). Please try again.' };
    }
    return { success: false, error: 'Failed to add VPS instance. ' + error.message };
  }
}

export async function getVpsInstances(): Promise<any[]> {
  try {
    const vpsList = db.prepare('SELECT * FROM vps_instances ORDER BY created_at DESC').all();
    return vpsList;
  } catch (error) {
    console.error('Error fetching VPS instances:', error);
    return [];
  }
}

export async function deleteVpsInstance(id: number): Promise<ActionResult> {
  try {
    const result = db.prepare('DELETE FROM vps_instances WHERE id = ?').run(id);
    if (result.changes === 0) {
      return { success: false, error: 'VPS instance not found or already deleted.' };
    }
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting VPS instance:', error);
    return { success: false, error: 'Failed to delete VPS instance.' };
  }
}
