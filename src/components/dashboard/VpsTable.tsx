
'use client';

import type { VpsData } from '@/types/vps-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VpsTableRow, VpsTableSkeletonRow } from './VpsTableRow';
import { ServerOffIcon } from 'lucide-react';
import React from 'react';

interface VpsTableProps {
  vpsList: VpsData[] | null;
  isLoading: boolean;
  onActionSuccess: () => void; // Callback for after actions like renewal
}

export function VpsTable({ vpsList, isLoading, onActionSuccess }: VpsTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden bg-card shadow">
      <Table className="min-w-full">
        <TableHeader className="bg-muted/30">
          <TableRow>{/*
          */}<TableHead className="p-2 text-center w-16">Status</TableHead>{/*
          */}<TableHead className="p-2">Name</TableHead>{/*
          */}<TableHead className="p-2">System</TableHead>{/*
          */}<TableHead className="p-2">Location</TableHead>{/*
          */}<TableHead className="p-2">Price</TableHead>{/*
          */}<TableHead className="p-2">Uptime</TableHead>{/*
          */}<TableHead className="p-2 min-w-[150px]">Remaining</TableHead>{/*
          */}<TableHead className="p-2 text-center">Load</TableHead>{/*
          */}<TableHead className="p-2 whitespace-nowrap">NIC ↓ | ↑</TableHead>{/*
          */}<TableHead className="p-2 whitespace-nowrap">Usage ↓ | ↑</TableHead>{/*
          */}<TableHead className="p-2 w-24">CPU</TableHead>{/*
          */}<TableHead className="p-2 w-24">RAM</TableHead>{/*
          */}<TableHead className="p-2 w-24">Disk</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && [...Array(3)].map((_, i) => <VpsTableSkeletonRow key={`skeleton-${i}`} />)}
          {!isLoading && vpsList && vpsList.length > 0 && vpsList.map((vps) => (
            <VpsTableRow key={vps.id} vps={vps} onActionSuccess={onActionSuccess} />
          ))}
          {!isLoading && (!vpsList || vpsList.length === 0) && (
            <TableRow>
              <TableCell colSpan={13} className="h-32 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <ServerOffIcon className="w-12 h-12 text-muted-foreground/50" />
                  No VPS instances found.
                  <p className="text-xs">Add a server in the admin panel or deploy an agent to see your VPS status here.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
