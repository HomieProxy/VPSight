
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { VpsTable } from '@/components/dashboard/VpsTable';
import type { VpsData } from '@/types/vps-data';

interface VpsDashboardPageProps {
  params?: Record<string, string | string[] | undefined>;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function VpsDashboardPage({ params, searchParams }: VpsDashboardPageProps) {
  const [vpsList, setVpsList] = useState<VpsData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
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
      setVpsList([]); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <DashboardHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
              <span className="font-medium">Error!</span> {error}
            </div>
          )}
          <VpsTable vpsList={vpsList} isLoading={isLoading} onActionSuccess={fetchData} />
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground mt-8">
        VPSight &copy; {currentYear !== null ? currentYear : ''}
      </footer>
    </div>
  );
}
