import { GaugeCircleIcon, ShieldCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export function DashboardHeader() {
  return (
    <header className="bg-card shadow-md p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <GaugeCircleIcon className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-2xl font-headline font-semibold text-foreground">
            VPSight
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/admin/login" passHref>
            <Button variant="outline" size="sm">
              <ShieldCheckIcon className="mr-2 h-4 w-4" />
              Admin Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
