
'use client';

import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { logout, getVpsInstances, deleteVpsInstance } from '../actions';
import type { ActionResult, VpsAdminEntry } from '../definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddServerDialog } from '@/components/admin/AddServerDialog';
import { EditServerDialog } from '@/components/admin/EditServerDialog';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import {
  LogOutIcon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  Trash2Icon,
  UsersIcon, 
  ListXIcon,
  RefreshCwIcon,
  FilePenLineIcon,
  ServerIcon,
  CopyIcon
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
} from "@/components/ui/alert-dialog"


const AdminDashboardPage: NextPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [vpsEntries, setVpsEntries] = useState<VpsAdminEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddServerDialogOpen, setIsAddServerDialogOpen] = useState(false);
  const [isEditServerDialogOpen, setIsEditServerDialogOpen] = useState(false); 
  const [selectedVpsToEdit, setSelectedVpsToEdit] = useState<VpsAdminEntry | null>(null); 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedVpsIdToDelete, setSelectedVpsIdToDelete] = useState<number | null>(null);


  const fetchVpsData = async () => {
    setIsLoading(true);
    try {
      const dataFromDb = await getVpsInstances();
      setVpsEntries(dataFromDb); 
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
      fetchVpsData(); 
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

  const openEditDialog = (vps: VpsAdminEntry) => {
    setSelectedVpsToEdit(vps);
    setIsEditServerDialogOpen(true);
  };

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command).then(() => {
      toast({ title: 'Copied!', description: 'Install command copied to clipboard.' });
    }).catch(err => {
      toast({ title: 'Error', description: 'Failed to copy command.', variant: 'destructive' });
    });
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOutIcon className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
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
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                     [...Array(3)].map((_, i) => (
                        <TableRow key={`skeleton-${i}`}>
                          {[...Array(10)].map((_, j) => (
                            <TableCell key={`cell-${j}`} className="py-3 px-2">
                              <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                  ) : vpsEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center">
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
                        <TableCell>{vps.ip_address || 'N/A (Agent Reported)'}</TableCell>
                        <TableCell>{vps.country_region || 'N/A'}</TableCell>
                        <TableCell>{vps.agent_version || 'N/A'}</TableCell>
                        <TableCell className="truncate max-w-[100px] font-mono text-xs" title={vps.secret}>{vps.secret}</TableCell>
                        <TableCell>
                          <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => handleCopyCommand(vps.install_command)}>
                             <CopyIcon className="mr-1 h-3 w-3" /> Copy
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => openEditDialog(vps)}>
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
        onSuccess={fetchVpsData}
      />
      
      {selectedVpsToEdit && (
        <EditServerDialog
          key={selectedVpsToEdit.id} 
          open={isEditServerDialogOpen}
          onOpenChange={setIsEditServerDialogOpen}
          vps={selectedVpsToEdit}
          onSuccess={() => {
            fetchVpsData();
            setSelectedVpsToEdit(null); 
          }}
        />
      )}


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
