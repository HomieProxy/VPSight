
'use client';

import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { logout, getVpsInstances, deleteVpsInstance } from '../actions';
import type { ActionResult } from '../definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddServerDialog } from '@/components/admin/AddServerDialog';
import {
  LogOutIcon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  Trash2Icon,
  UsersIcon, 
  ListXIcon,
  RefreshCwIcon,
  FilePenLineIcon,
  ServerIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Matches the vps_instances table structure + reconstructed note
export interface VpsAdminEntry {
  id: number;
  name: string;
  type: string | null;
  group_name: string | null; // Renamed from 'group' to match DB
  ip_address: string | null;   // Renamed from 'ip'
  country_region: string | null; // New field
  agent_version: string | null;
  secret: string;
  install_command: string;
  note: {
    billingDataMod?: {
      startDate?: string | null;
      endDate?: string | null;
      cycle?: string | null;
      amount?: string | null;
    };
    planDataMod?: {
      bandwidth?: string | null;
      trafficType?: 0 | 1 | 2 | null;
    };
  };
  created_at: string;
}

const formatTrafficType = (type?: 0 | 1 | 2 | null) => {
  if (type === 1) return 'Outbound only';
  if (type === 2) return 'Inbound only';
  if (type === 0) return 'Both';
  return 'N/A';
};

const AdminDashboardPage: NextPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [vpsEntries, setVpsEntries] = useState<VpsAdminEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddServerDialogOpen, setIsAddServerDialogOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedVpsIdToDelete, setSelectedVpsIdToDelete] = useState<number | null>(null);


  const fetchVpsData = async () => {
    setIsLoading(true);
    try {
      const dataFromDb = await getVpsInstances();
      const formattedData: VpsAdminEntry[] = dataFromDb.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        group_name: item.group_name,
        ip_address: item.ip_address,
        country_region: item.country_region,
        agent_version: item.agent_version,
        secret: item.secret,
        install_command: item.install_command,
        note: {
          billingDataMod: {
            startDate: item.note_billing_start_date,
            endDate: item.note_billing_end_date,
            cycle: item.note_billing_cycle,
            amount: item.note_billing_amount,
          },
          planDataMod: {
            bandwidth: item.note_plan_bandwidth,
            trafficType: item.note_plan_traffic_type,
          },
        },
        created_at: item.created_at,
      }));
      setVpsEntries(formattedData);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch VPS data.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVpsData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      // router.push('/admin/login') is handled by middleware/redirect in logout action
    } catch (error) {
      console.error('Logout failed:', error);
      toast({ title: 'Logout Failed', description: 'Could not log you out. Please try again.', variant: 'destructive' });
    }
  };

  const handleDeleteVps = async () => {
    if (selectedVpsIdToDelete === null) return;
    
    const result = await deleteVpsInstance(selectedVpsIdToDelete);
    if (result.success) {
      toast({ title: 'Success', description: 'VPS instance deleted.' });
      fetchVpsData(); // Refresh data
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to delete VPS instance.', variant: 'destructive' });
    }
    setShowDeleteConfirm(false);
    setSelectedVpsIdToDelete(null);
  };

  const openDeleteConfirmDialog = (id: number) => {
    setSelectedVpsIdToDelete(id);
    setShowDeleteConfirm(true);
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
          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Admin Controls</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
              <Button variant="outline" onClick={() => setIsAddServerDialogOpen(true)}>
                <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Server
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
                    <TableHead>Country/Region</TableHead>
                    <TableHead>Agent Ver.</TableHead>
                    <TableHead>Secret</TableHead>
                    <TableHead>Install Cmd</TableHead>
                    <TableHead className="min-w-[250px]">Note</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                     [...Array(3)].map((_, i) => (
                        <TableRow key={`skeleton-${i}`}>
                          {[...Array(11)].map((_, j) => (
                            <TableCell key={`cell-${j}`} className="py-3 px-2">
                              <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                  ) : vpsEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ServerIcon className="w-10 h-10" />
                            No VPS data available. Click "Add Server" to begin.
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    vpsEntries.map((vps) => (
                      <TableRow key={vps.id}>
                        <TableCell>{vps.id}</TableCell>
                        <TableCell className="font-medium">{vps.name}</TableCell>
                        <TableCell>
                          {vps.type ? <Badge variant="secondary">{vps.type}</Badge> : 'N/A'}
                        </TableCell>
                        <TableCell>{vps.group_name || 'N/A'}</TableCell>
                        <TableCell>{vps.ip_address || 'N/A'}</TableCell>
                        <TableCell>{vps.country_region || 'N/A'}</TableCell>
                        <TableCell>{vps.agent_version || 'N/A'}</TableCell>
                        <TableCell className="truncate max-w-[100px] font-mono text-xs" title={vps.secret}>{vps.secret}</TableCell>
                        <TableCell>
                          <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => navigator.clipboard.writeText(vps.install_command)}>Copy Cmd</Button>
                        </TableCell>
                        <TableCell className="text-xs">
                          {vps.note.billingDataMod && (Object.values(vps.note.billingDataMod).some(v => v)) && (
                            <div className="mb-1">
                              <p className="font-semibold">Billing:</p>
                              {vps.note.billingDataMod.startDate && <p>Start: {vps.note.billingDataMod.startDate}</p>}
                              {vps.note.billingDataMod.endDate && <p>End: {vps.note.billingDataMod.endDate}</p>}
                              {vps.note.billingDataMod.cycle && <p>Cycle: {vps.note.billingDataMod.cycle}</p>}
                              {vps.note.billingDataMod.amount && <p>Amount: {vps.note.billingDataMod.amount}</p>}
                            </div>
                          )}
                          {vps.note.planDataMod && (Object.values(vps.note.planDataMod).some(v => v !== null && v !== undefined)) && (
                            <div>
                              <p className="font-semibold">Plan:</p>
                              {vps.note.planDataMod.bandwidth && <p>Bandwidth: {vps.note.planDataMod.bandwidth}</p>}
                              {vps.note.planDataMod.trafficType !== undefined && vps.note.planDataMod.trafficType !== null && <p>Traffic: {formatTrafficType(vps.note.planDataMod.trafficType)}</p>}
                            </div>
                          )}
                          {(!vps.note.billingDataMod || !Object.values(vps.note.billingDataMod).some(v => v)) && 
                           (!vps.note.planDataMod || !Object.values(vps.note.planDataMod).some(v => v !== null && v !== undefined)) && 
                           <span className="text-muted-foreground">N/A</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" disabled> {/* Edit disabled for now */}
                              <FilePenLineIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" title="Delete" onClick={() => openDeleteConfirmDialog(vps.id)}>
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

      <AddServerDialog 
        open={isAddServerDialogOpen} 
        onOpenChange={setIsAddServerDialogOpen}
        onSuccess={fetchVpsData} // Refresh data on success
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the VPS instance
              and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedVpsIdToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVps} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="text-center p-4 text-sm text-muted-foreground mt-8">
        VPSight Admin &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default AdminDashboardPage;
