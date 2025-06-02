import { GaugeCircleIcon } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="bg-card shadow-md p-4">
      <div className="container mx-auto flex items-center">
        <GaugeCircleIcon className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-2xl font-headline font-semibold text-foreground">
          VPSight
        </h1>
      </div>
    </header>
  );
}
