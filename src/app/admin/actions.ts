
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE } from '@/lib/constants';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { AddVpsInstanceInput, ActionResult, VpsAdminEntry, EditVpsInstanceInput } from './definitions';
import { AddVpsInstanceSchema, EditVpsInstanceSchema } from './definitions';
import { addMonths, addYears, format, parseISO, isValid } from 'date-fns';

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
      country_region,
      note_billing_start_date,
      note_billing_end_date,
      note_billing_cycle,
      note_billing_amount,
      note_plan_bandwidth,
      note_plan_traffic_type
    } = validation.data;

    const secret = crypto.randomBytes(8).toString('hex').toUpperCase();
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const install_command = `curl -sSL ${appUrl}/install_agent.sh | sudo bash -s ${secret}`;

    const result = db.prepare(
      `INSERT INTO vps_instances (
        name, type, group_name, country_region, secret, install_command, ip_address,
        note_billing_start_date, note_billing_end_date, note_billing_cycle, note_billing_amount,
        note_plan_bandwidth, note_plan_traffic_type
      ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?)`
    ).run(
      name, type || null, group_name || null, country_region || null, secret, install_command,
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

export async function getVpsInstances(): Promise<VpsAdminEntry[]> {
  try {
    const vpsList: VpsAdminEntry[] = db.prepare(`
      SELECT 
        id, name, type, group_name, ip_address, country_region, agent_version, 
        secret, install_command, created_at,
        note_billing_start_date, note_billing_end_date, note_billing_cycle, note_billing_amount,
        note_plan_bandwidth, note_plan_traffic_type
      FROM vps_instances 
      ORDER BY created_at DESC
    `).all() as VpsAdminEntry[];
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
    revalidatePath('/'); // Revalidate public dashboard
    revalidatePath('/api/vps-list'); // Revalidate API
    return { success: true };
  } catch (error) {
    console.error('Error deleting VPS instance:', error);
    return { success: false, error: 'Failed to delete VPS instance.' };
  }
}

export async function getVpsInstanceById(id: number): Promise<VpsAdminEntry | null> {
  try {
    const vps: VpsAdminEntry | undefined = db.prepare(
      `SELECT 
        id, name, type, group_name, ip_address, country_region, agent_version, 
        secret, install_command, created_at,
        note_billing_start_date, note_billing_end_date, note_billing_cycle, note_billing_amount,
        note_plan_bandwidth, note_plan_traffic_type
       FROM vps_instances WHERE id = ?`
    ).get(id) as VpsAdminEntry | undefined;
    return vps || null;
  } catch (error) {
    console.error(`Error fetching VPS instance with id ${id}:`, error);
    return null;
  }
}

export async function updateVpsInstance(input: EditVpsInstanceInput): Promise<ActionResult> {
  try {
    const validation = EditVpsInstanceSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }

    const {
      id,
      name,
      type,
      group_name,
      country_region,
      note_billing_start_date,
      note_billing_end_date,
      note_billing_cycle,
      note_billing_amount,
      note_plan_bandwidth,
      note_plan_traffic_type
    } = validation.data;

    const result = db.prepare(
      `UPDATE vps_instances SET
        name = ?,
        type = ?,
        group_name = ?,
        country_region = ?,
        note_billing_start_date = ?,
        note_billing_end_date = ?,
        note_billing_cycle = ?,
        note_billing_amount = ?,
        note_plan_bandwidth = ?,
        note_plan_traffic_type = ?
      WHERE id = ?`
    ).run(
      name,
      type || null,
      group_name || null,
      country_region || null,
      note_billing_start_date || null,
      note_billing_end_date || null,
      note_billing_cycle || null,
      note_billing_amount || null,
      note_plan_bandwidth || null,
      note_plan_traffic_type !== undefined ? note_plan_traffic_type : null,
      id
    );

    if (result.changes === 0) {
      return { success: false, error: 'VPS instance not found or no changes made.' };
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/'); // Revalidate public dashboard
    revalidatePath('/api/vps-list'); // Revalidate API
    return { success: true };

  } catch (error: any) {
    console.error('Error updating VPS instance:', error);
    return { success: false, error: 'Failed to update VPS instance. ' + error.message };
  }
}

export async function renewVpsInstance(id: number): Promise<ActionResult> {
  try {
    const vps = await getVpsInstanceById(id);
    if (!vps) {
      return { success: false, error: 'VPS instance not found.' };
    }

    if (!vps.note_billing_end_date || !vps.note_billing_cycle) {
      return { success: false, error: 'Billing end date or cycle not set for this VPS.' };
    }

    const currentEndDate = parseISO(vps.note_billing_end_date);
    if (!isValid(currentEndDate)) {
        return { success: false, error: 'Invalid current billing end date.' };
    }

    let newEndDate: Date;
    const cycle = vps.note_billing_cycle.toLowerCase();

    if (cycle.includes('month')) {
      const monthsMatch = cycle.match(/(\d+)\s*month/);
      const numMonths = monthsMatch ? parseInt(monthsMatch[1], 10) : 1;
      newEndDate = addMonths(currentEndDate, numMonths);
    } else if (cycle.includes('year') || cycle.includes('annu')) {
      const yearsMatch = cycle.match(/(\d+)\s*year/);
      const numYears = yearsMatch ? parseInt(yearsMatch[1], 10) : 1;
      if (cycle.includes('bi-annu') || cycle.includes('biannu')) { // specific for "biannually"
        newEndDate = addYears(currentEndDate, 2);
      } else {
        newEndDate = addYears(currentEndDate, numYears);
      }
    } else if (cycle.includes('quarter')) {
        newEndDate = addMonths(currentEndDate, 3);
    }
    // Add more cycle parsing logic here (e.g., "X days", "X weeks")
    else {
      return { success: false, error: `Unsupported billing cycle: ${vps.note_billing_cycle}` };
    }

    const formattedNewEndDate = format(newEndDate, 'yyyy-MM-dd');

    const result = db.prepare(
      'UPDATE vps_instances SET note_billing_end_date = ? WHERE id = ?'
    ).run(formattedNewEndDate, id);

    if (result.changes === 0) {
      return { success: false, error: 'Failed to update VPS instance for renewal.' };
    }

    revalidatePath('/admin/dashboard'); // If admin views this info
    revalidatePath('/'); // Revalidate public dashboard
    revalidatePath('/api/vps-list'); // Revalidate API that serves public dashboard
    return { success: true, data: { newEndDate: formattedNewEndDate } };

  } catch (error: any) {
    console.error('Error renewing VPS instance:', error);
    return { success: false, error: 'Failed to renew VPS instance. ' + error.message };
  }
}
