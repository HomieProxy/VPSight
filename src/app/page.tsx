'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { SystemInfoCard } from '@/components/dashboard/SystemInfoCard';
import { ResourceUsageCard } from '@/components/dashboard/ResourceUsageCard';
import { NetworkDataCard } from '@/components/dashboard/NetworkDataCard';
import { SystemLoadCard } from '@/components/dashboard/SystemLoadCard';
import { AgentDeploymentCard } from '@/components/dashboard/AgentDeploymentCard';
// import { initialVpsData, generateRandomizedMetrics } from '@/lib/mock-data'; // Mock data removed
import type { VpsData } from '@/types/vps-data';
import { Skeleton } from '@/components/ui/skeleton';

export default function VpsDashboardPage() {
  const [vpsData, setVpsData] = useState<VpsData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Will remain true until real data fetching is implemented

  // useEffect(() => {
  //   // Simulate initial data fetch
  //   setTimeout(() => {
  //     setVpsData(initialVpsData);
  //     setIsLoading(false);
  //   }, 1000);
  // }, []);

  // useEffect(() => {
  //   if (!vpsData || isLoading) return;

  //   const intervalId = setInterval(() => {
  //     setVpsData((prevData) => 
  //       prevData ? generateRandomizedMetrics(prevData) : null
  //     );
  //   }, 5000); // Update every 5 seconds

  //   return () => clearInterval(intervalId);
  // }, [vpsData, isLoading]);

  // Placeholder: In a real app, you would fetch data here and set isLoading to false
  // For now, we simulate a perpetual loading state as mock data is removed.
  // You might want to set isLoading to false after a timeout if you want to show an "empty" state
  // instead of perpetual skeletons. e.g.
  // useEffect(() => {
  //   const timer = setTimeout(() => setIsLoading(false), 2000); // Show empty state after 2s
  //   return () => clearTimeout(timer);
  // }, []);


  if (isLoading || !vpsData) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
            <AgentDeploymentCard /> {/* Keep agent deployment card visible */}
          </div>
        </main>
         <footer className="text-center p-4 text-sm text-muted-foreground">
          VPSight &copy; {new Date().getFullYear()}
        </footer>
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
