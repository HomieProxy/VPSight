
export interface VpsData {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  system: string; // Original OS string from admin (e.g., "Debian 11")
  location: string; // Was countryRegion
  ip_address: string | null; // For detailed view
  price: string;
  uptime: string;
  load: number;
  nicDown: string;
  nicUp: string;
  cpu: {
    model: string;
    cores: number;
    usage: number; // Percentage
  };
  disk: {
    used: string;
    total: string;
    percentage: number;
  };
  ram: {
    used: string;
    total: string;
    percentage: number;
  };
  swap: {
    status: string; // e.g., "OFF", "ON"
    used?: string;
    total?: string;
    percentage?: number;
  };
  network: {
    totalIn: string;
    totalOut: string;
    currentMonthIn: string; // Usage for current billing cycle
    currentMonthOut: string; // Usage for current billing cycle
  };
  loadAverage: [number, number, number];
  processCount: number;
  connections: {
    tcp: number;
    udp: number;
  };
  bootTime: string; // ISO string
  lastActive: string; // ISO string
  daysToExpiry: number | string; // Renamed from expires_in, calculation done in API
  
  // Fields for expanded detail view, populated from admin notes
  billingCycle?: string | null;
  planBandwidth?: string | null;
  planTrafficType?: string | null; // Mapped to "Both", "Outbound only", "Inbound only"
  agentVersion?: string | null;
}
