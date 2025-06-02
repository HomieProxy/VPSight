
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/vps-list');
        if (!response.ok) {
          throw new Error(`Failed to fetch VPS data: ${response.statusText}`);
        }
        const data: VpsData[] = await response.json();
        setVpsList(data);
      } catch (err: any) {
        console.error("Error fetching VPS data:", err);
        setError(err.message || 'An unknown error occurred while fetching data.');
        setVpsList([]); // Set to empty array on error to show "No VPS" message or error specific message
      } finally {
        setIsLoading(false);
      }
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
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
              <span className="font-medium">Error!</span> {error}
            </div>
          )}
          <VpsTable vpsList={vpsList} isLoading={isLoading} />
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground mt-8">
        VPSight &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
