
'use client';

import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { logout } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LogOutIcon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  Trash2Icon,
  UsersIcon, // Using UsersIcon for Batch Group Edit
  ListXIcon,
  RefreshCwIcon,
  FilePenLineIcon,
  ServerIcon // Using ServerIcon for placeholder in table
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Placeholder type for VPS data - will be refined when data is integrated
interface VpsAdminEntry {
  id: string;
  name: string;
  type: string;
  group: string;
  ip: string;
  agentVersion: string;
  secret: string;
  installCommand: string;
  note: {
    billingDataMod?: {
      startDate?: string;
      endDate?: string;
      cycle?: string;
      amount?: string;
    };
    planDataMod?: {
      bandwidth?: string;
      trafficType?: 0 | 1 | 2;
    };
  };
}

const formatTrafficType = (type?: 0 | 1 | 2) => {
  if (type === 1) return 'Outbound only';
  if (type === 2) return 'Inbound only';
  if (type === 0) return 'Both';
  return 'N/A';
};

const AdminDashboardPage: NextPage = () => {
  const router = useRouter();
  const { toast } = useToast();

  // Placeholder for VPS data - replace with actual data fetching
  const vpsEntries: VpsAdminEntry[] = []; // Empty for now as requested

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({ title: 'Logout Failed', description: 'Could not log you out. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <Card className="w-full max-w-full shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <LayoutDashboardIcon className="h-8 w-8 text-primary mr-3" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-headline">Admin Control Panel</CardTitle>
              <CardDescription>Manage your VPS instances and agent settings.</CardDescription>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Admin Control Section */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Admin Controls</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
              <Button variant="outline">
                <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Server
              </Button>
              <Button variant="outline" disabled>
                <Trash2Icon className="mr-2 h-4 w-4" /> Delete
              </Button>
              <Button variant="outline" disabled>
                <UsersIcon className="mr-2 h-4 w-4" /> Batch Group Edit
              </Button>
              <Button variant="outline" disabled>
                <ListXIcon className="mr-2 h-4 w-4" /> Batch Delete
              </Button>
              <Button variant="outline" disabled>
                <RefreshCwIcon className="mr-2 h-4 w-4" /> Trigger Update Agent
              </Button>
            </div>
          </div>

          {/* VPS Control Section */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">VPS Control</h2>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Agent Ver.</TableHead>
                    <TableHead>Secret</TableHead>
                    <TableHead>Install Cmd</TableHead>
                    <TableHead className="min-w-[250px]">Note</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vpsEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ServerIcon className="w-10 h-10" />
                            No VPS data available.
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    vpsEntries.map((vps, index) => (
                      <TableRow key={vps.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{vps.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{vps.type}</Badge>
                        </TableCell>
                        <TableCell>{vps.group}</TableCell>
                        <TableCell>{vps.ip}</TableCell>
                        <TableCell>{vps.agentVersion}</TableCell>
                        <TableCell className="truncate max-w-[100px]">{vps.secret}</TableCell>
                        <TableCell>
                          <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => navigator.clipboard.writeText(vps.installCommand)}>Copy</Button>
                        </TableCell>
                        <TableCell className="text-xs">
                          {vps.note.billingDataMod && (
                            <div className="mb-1">
                              <p className="font-semibold">Billing:</p>
                              {vps.note.billingDataMod.startDate && <p>Start: {vps.note.billingDataMod.startDate}</p>}
                              {vps.note.billingDataMod.endDate && <p>End: {vps.note.billingDataMod.endDate}</p>}
                              {vps.note.billingDataMod.cycle && <p>Cycle: {vps.note.billingDataMod.cycle}</p>}
                              {vps.note.billingDataMod.amount && <p>Amount: {vps.note.billingDataMod.amount}</p>}
                            </div>
                          )}
                          {vps.note.planDataMod && (
                            <div>
                              <p className="font-semibold">Plan:</p>
                              {vps.note.planDataMod.bandwidth && <p>Bandwidth: {vps.note.planDataMod.bandwidth}</p>}
                              {vps.note.planDataMod.trafficType !== undefined && <p>Traffic: {formatTrafficType(vps.note.planDataMod.trafficType)}</p>}
                            </div>
                          )}
                          {!vps.note.billingDataMod && !vps.note.planDataMod && <span className="text-muted-foreground">N/A</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <FilePenLineIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      <footer className="text-center p-4 text-sm text-muted-foreground mt-8">
        VPSight Admin &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default AdminDashboardPage;

    