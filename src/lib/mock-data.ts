import type { VpsData } from '@/types/vps-data';

export const initialVpsData: VpsData = {
  id: 'vps-main-123',
  name: 'Main Production Server',
  system: 'Debian 11.11 [kvm:x86_64]',
  cpu: {
    model: 'Intel(R) Xeon(R) Platinum 8259CL CPU @ 2.50GHz',
    cores: 1,
    usage: 6.36,
  },
  disk: {
    used: '7.04G',
    total: '31.33G',
    percentage: 22.47,
  },
  ram: {
    used: '499.28M',
    total: '978.99M',
    percentage: 51.00,
  },
  swap: {
    status: 'OFF',
    percentage: 0,
  },
  network: {
    totalIn: '1.82T',
    totalOut: '1.81T',
    currentMonthIn: '1.09T',
    currentMonthOut: '998GB',
  },
  loadAverage: [0.43, 0.26, 0.15],
  processCount: 83,
  connections: {
    tcp: 360,
    udp: 2,
  },
  bootTime: new Date('2025-05-08T10:38:00Z').toISOString(),
  lastActive: new Date().toISOString(),
};

export function generateRandomizedMetrics(baseData: VpsData): VpsData {
  const randomFluctuation = (value: number, maxDelta: number, min = 0, max = 100) => {
    const delta = (Math.random() - 0.5) * 2 * maxDelta;
    return Math.max(min, Math.min(max, parseFloat((value + delta).toFixed(2))));
  };

  const addTraffic = (valueStr: string, amountGb: number): string => {
    // Super simplified: assumes TB or GB input, adds GB, keeps unit
    const unit = valueStr.slice(-2);
    let value = parseFloat(valueStr.slice(0, -2));
    if (unit.toUpperCase() === 'TB') {
      value = value * 1024; // Convert TB to GB
    }
    value += amountGb;
    if (unit.toUpperCase() === 'TB' || value >= 1024) {
      return (value / 1024).toFixed(2) + 'T';
    }
    return value.toFixed(2) + 'G';
  };


  return {
    ...baseData,
    cpu: {
      ...baseData.cpu,
      usage: randomFluctuation(baseData.cpu.usage, 5, 0, 100),
    },
    ram: {
      ...baseData.ram,
      percentage: randomFluctuation(baseData.ram.percentage, 5, 0, 100),
      used: `${(parseFloat(baseData.ram.total) * (randomFluctuation(baseData.ram.percentage, 5, 0, 100) / 100)).toFixed(2)}M`
    },
    disk: { // Disk usage usually doesn't fluctuate wildly second by second
        ...baseData.disk,
        percentage: randomFluctuation(baseData.disk.percentage, 0.1, 0, 100),
        used: `${(parseFloat(baseData.disk.total) * (randomFluctuation(baseData.disk.percentage, 0.1, 0, 100) / 100)).toFixed(2)}G`
    },
    network: {
      ...baseData.network,
      currentMonthIn: addTraffic(baseData.network.currentMonthIn, Math.random() * 0.1), // Add small random GB
      currentMonthOut: addTraffic(baseData.network.currentMonthOut, Math.random() * 0.1),
    },
    loadAverage: [
      randomFluctuation(baseData.loadAverage[0], 0.1, 0, baseData.cpu.cores * 4),
      randomFluctuation(baseData.loadAverage[1], 0.05, 0, baseData.cpu.cores * 4),
      randomFluctuation(baseData.loadAverage[2], 0.02, 0, baseData.cpu.cores * 4),
    ],
    processCount: Math.max(10, baseData.processCount + Math.floor((Math.random() - 0.5) * 4)),
    connections: {
      tcp: Math.max(0, baseData.connections.tcp + Math.floor((Math.random() - 0.5) * 20)),
      udp: Math.max(0, baseData.connections.udp + Math.floor((Math.random() - 0.5) * 2)),
    },
    lastActive: new Date().toISOString(),
  };
}
