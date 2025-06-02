'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { SystemInfoCard } from '@/components/dashboard/SystemInfoCard';
import { ResourceUsageCard } from '@/components/dashboard/ResourceUsageCard';
import { NetworkDataCard } from '@/components/dashboard/NetworkDataCard';
import { SystemLoadCard } from '@/components/dashboard/SystemLoadCard';
import { AgentDeploymentCard } from '@/components/dashboard/AgentDeploymentCard';
import { initialVpsData, generateRandomizedMetrics } from '@/lib/mock-data';
import type { VpsData } from '@/types/vps-data';
import { Skeleton } from '@/components/ui/skeleton';

export default function VpsDashboardPage() {
  const [vpsData, setVpsData] = useState<VpsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data fetch
    setTimeout(() => {
      setVpsData(initialVpsData);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!vpsData || isLoading) return;

    const intervalId = setInterval(() => {
      setVpsData((prevData) => 
        prevData ? generateRandomizedMetrics(prevData) : null
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId);
  }, [vpsData, isLoading]);

  if (isLoading || !vpsData) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
            <Skeleton className="h-48 rounded-lg col-span-1 md:col-span-2 lg:col-span-3" />
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SystemInfoCard data={vpsData} />
          <ResourceUsageCard data={vpsData} />
          <NetworkDataCard data={vpsData} />
          <SystemLoadCard data={vpsData} />
          <AgentDeploymentCard />
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        VPSight &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
