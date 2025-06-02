
import { z } from 'zod';

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
