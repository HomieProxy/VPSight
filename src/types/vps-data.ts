
export interface VpsData {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error'; // New: For status indicator
  system: string; // Existing: e.g. "Debian 11"
  location: string; // New: e.g. "HK"
  price: string; // New: e.g. "$4.20/月"
  uptime: string; // New: e.g. "138 Days"
  load: number; // New for single load value display, e.g., from loadAverage[0]
  nicDown: string; // New: e.g. "166.17K"
  nicUp: string; // New: e.g. "159.82K"
  usageDown: string; // New: e.g. "4.17T" (can be derived from network.totalIn)
  usageUp: string; // New: e.g. "4.17T" (can be derived from network.totalOut)
  cpu: {
    model: string;
    cores: number;
    usage: number; // percentage for usage bar
  };
  disk: {
    used: string;
    total: string;
    percentage: number; // for usage bar
  };
  ram: {
    used: string;
    total: string;
    percentage: number; // for usage bar
  };
  swap: {
    status: string;
    used?: string;
    total?: string;
    percentage?: number;
  };
  network: { // Keep original network fields for source data
    totalIn: string;
    totalOut: string;
    currentMonthIn: string;
    currentMonthOut: string;
  };
  loadAverage: [number, number, number]; // Source for 'load'
  processCount: number;
  connections: {
    tcp: number;
    udp: number;
  };
  bootTime: string;
  lastActive: string;
}
