
export interface VpsData {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  system: string;
  countryRegion: string; // Replaces 'location', maps to country_region from admin form/DB
  price: string; 
  uptime: string; 
  load: number; 
  nicDown: string;
  nicUp: string; 
  usageDown: string; 
  usageUp: string; 
  cpu: {
    model: string;
    cores: number;
    usage: number; 
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
    status: string;
    used?: string;
    total?: string;
    percentage?: number;
  };
  network: { 
    totalIn: string;
    totalOut: string;
    currentMonthIn: string;
    currentMonthOut: string;
  };
  loadAverage: [number, number, number];
  processCount: number;
  connections: {
    tcp: number;
    udp: number;
  };
  bootTime: string;
  lastActive: string;
}
