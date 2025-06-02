export interface VpsData {
  id: string;
  name: string;
  system: string;
  cpu: {
    model: string;
    cores: number;
    usage: number; // percentage
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
    status: string; // e.g., "OFF", "128M / 512M (25%)"
    used?: string;
    total?: string;
    percentage?: number; // Overall percentage if available, or 0 if OFF
  };
  network: {
    totalIn: string;
    totalOut: string;
    currentMonthIn: string;
    currentMonthOut: string;
  };
  loadAverage: [number, number, number]; // 1 min, 5 min, 15 min
  processCount: number;
  connections: {
    tcp: number;
    udp: number;
  };
  bootTime: string; // ISO string or formatted string
  lastActive: string; // ISO string or formatted string
}
