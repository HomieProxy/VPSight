
export interface VpsData {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  system: string;
  countryRegion: string;
  price: string;
  uptime: string;
  load: number;
  nicDown: string;
  nicUp: string;
  // usageDown and usageUp are replaced by network.currentMonthIn/Out for the "Usage" column
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
  daysToExpiry: number | string; // New field
}

