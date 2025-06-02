
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { VpsAdminEntry } from '@/app/admin/definitions';
import type { VpsData } from '@/types/vps-data';
import { differenceInDays, parseISO, isFuture, isValid } from 'date-fns';

export async function GET() {
  try {
    const adminEntries: VpsAdminEntry[] = db.prepare(
      `SELECT
        id, name, type, group_name, ip_address, country_region, agent_version,
        secret, install_command, created_at,
        note_billing_start_date, note_billing_end_date, note_billing_cycle, note_billing_amount,
        note_plan_bandwidth, note_plan_traffic_type
      FROM vps_instances
      ORDER BY created_at DESC`
    ).all() as VpsAdminEntry[];

    const vpsDataList: VpsData[] = adminEntries.map(entry => {
      let daysToExpiry: number | string = 'N/A';
      if (entry.note_billing_end_date) {
        const endDate = parseISO(entry.note_billing_end_date);
        if (isValid(endDate)) {
          if (isFuture(endDate)) {
            daysToExpiry = differenceInDays(endDate, new Date());
          } else {
            daysToExpiry = 'Expired';
          }
        }
      }

      return {
        id: entry.id.toString(),
        name: entry.name,
        status: 'offline', // Default to offline; will show as red. Agent should update this.
        system: entry.type || 'Unknown OS',
        countryRegion: entry.country_region || 'N/A',
        price: entry.note_billing_amount || 'N/A', // Correctly mapped
        uptime: 'N/A', // Placeholder
        load: 0, // Placeholder
        nicDown: '0 KB/s', // Placeholder
        nicUp: '0 KB/s', // Placeholder
        // usageDown & usageUp removed from VpsData, use network.currentMonthIn/Out for the "Usage" column
        cpu: {
          model: 'N/A', // Placeholder
          cores: 0, // Placeholder
          usage: 0, // Placeholder
        },
        disk: {
          used: '0 GB', // Placeholder
          total: '0 GB', // Placeholder
          percentage: 0, // Placeholder
        },
        ram: {
          used: '0 MB', // Placeholder
          total: '0 MB', // Placeholder
          percentage: 0, // Placeholder
        },
        swap: {
          status: 'OFF', // Placeholder
          percentage: 0,
        },
        network: {
          totalIn: '0 GB', // Placeholder
          totalOut: '0 GB', // Placeholder
          currentMonthIn: '0 GB', // Placeholder, agent should update
          currentMonthOut: '0 GB', // Placeholder, agent should update
        },
        loadAverage: [0, 0, 0], // Placeholder
        processCount: 0, // Placeholder
        connections: {
          tcp: 0, // Placeholder
          udp: 0, // Placeholder
        },
        bootTime: entry.created_at, // Use created_at as a stand-in for now
        lastActive: entry.created_at, // Use created_at as a stand-in for now
        daysToExpiry: daysToExpiry, // Calculated field
      };
    });

    return NextResponse.json(vpsDataList);
  } catch (error) {
    console.error('Error fetching VPS list for dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch VPS data' }, { status: 500 });
  }
}

