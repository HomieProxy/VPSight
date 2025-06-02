
'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { VpsTable } from '@/components/dashboard/VpsTable';
import type { VpsData } from '@/types/vps-data';
// AgentDeploymentCard is removed from this page, but you can add it elsewhere if needed.
// import { AgentDeploymentCard } from '@/components/dashboard/AgentDeploymentCard'; 

export default function VpsDashboardPage() {
  const [vpsList, setVpsList] = useState<VpsData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Placeholder for data fetching logic
  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      setIsLoading(true);
      // Replace this with your actual data fetching logic
      // For example, fetch('/api/vps-data').then(res => res.json()).then(data => setVpsList(data));
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      // To demonstrate the table with styled rows, we can temporarily set mock data.
      // Remove this or set to [] for production if no data is fetched initially.
      // setVpsList([]); // Set to empty array to show "No VPS instances found."
      // Or, to see a styled row:
      /*
      setVpsList([
        {
          id: 'vps-demo-1',
          name: 'Demo Server Alpha',
          status: 'online',
          system: 'Ubuntu 22.04',
          location: 'New York',
          price: '$5.00/mo',
          uptime: '32 Days',
          load: 0.15,
          nicDown: '120.5K',
          nicUp: '88.2K',
          usageDown: '1.2T',
          usageUp: '300G',
          cpu: { model: 'Basic CPU', cores: 1, usage: 25.5 },
          ram: { used: '512M', total: '1G', percentage: 50.0 },
          disk: { used: '10G', total: '25G', percentage: 40.0 },
          network: { totalIn: '1.2T', totalOut: '300G', currentMonthIn: '100G', currentMonthOut: '50G'},
          loadAverage: [0.15, 0.20, 0.25],
          processCount: 50,
          connections: { tcp: 10, udp: 2},
          bootTime: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
          lastActive: new Date().toISOString(),
          swap: { status: 'OFF' }
        }
      ]);
      */
       setVpsList([]); // Default to no data

      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <DashboardHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          {/* The AgentDeploymentCard could be placed here or in a dedicated section */}
          {/* <AgentDeploymentCard /> */}
          <VpsTable vpsList={vpsList} isLoading={isLoading} />
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground mt-8">
        VPSight &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
