
import { z } from 'zod';

// Zod schema for AddVpsInstance form validation
export const AddVpsInstanceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  group_name: z.string().optional(),
  // ip_address is no longer a form input, will be reported by agent
  country_region: z.string().optional(),
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

// Zod schema for EditVpsInstance form validation (can be expanded later)
export const EditVpsInstanceSchema = AddVpsInstanceSchema.extend({
  id: z.number(),
  // agent_version, secret, install_command are typically not directly edited
});

export type EditVpsInstanceInput = z.infer<typeof EditVpsInstanceSchema>;

export interface VpsAdminEntry {
  id: number;
  name: string;
  type: string | null;
  group_name: string | null;
  ip_address: string | null;
  country_region: string | null;
  agent_version: string | null;
  secret: string;
  install_command: string;
  note_billing_start_date: string | null;
  note_billing_end_date: string | null;
  note_billing_cycle: string | null;
  note_billing_amount: string | null;
  note_plan_bandwidth: string | null;
  note_plan_traffic_type: number | null;
  created_at: string;
}
