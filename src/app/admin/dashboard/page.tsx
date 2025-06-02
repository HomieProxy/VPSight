
'use client';

import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { logout } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOutIcon, LayoutDashboardIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboardPage: NextPage = () => {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      // The server action will handle the redirect.
      // router.push('/admin/login') is not strictly needed here if server action redirects.
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({ title: 'Logout Failed', description: 'Could not log you out. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-flex justify-center items-center mb-4">
            <LayoutDashboardIcon className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">Admin Dashboard</CardTitle>
          <CardDescription>Welcome to the VPSight admin area.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg mb-8">This is your protected admin dashboard.</p>
          <Button onClick={handleLogout} variant="destructive" size="lg" className="text-lg py-6 px-8">
            <LogOutIcon className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </CardContent>
      </Card>
       <footer className="text-center p-4 text-sm text-muted-foreground mt-8">
          VPSight Admin &copy; {new Date().getFullYear()}
        </footer>
    </div>
  );
};

export default AdminDashboardPage;
