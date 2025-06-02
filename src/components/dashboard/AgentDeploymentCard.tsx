import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TerminalIcon, CopyIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function AgentDeploymentCard() {
  const { toast } = useToast();
  // Updated command to use the local script from the public folder
  const command = 'curl -sSL /install_agent.sh | sudo bash -s YOUR_SECRET_CODE';

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(command).then(() => {
        toast({
          title: "Copied to clipboard!",
          description: "Agent deployment command copied.",
        });
      }).catch(err => {
        toast({
          title: "Failed to copy",
          description: "Could not copy command to clipboard.",
          variant: "destructive",
        });
        console.error('Failed to copy: ', err);
      });
    } else {
      toast({
        title: "Clipboard not available",
        description: "Cannot copy to clipboard in this environment.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <TerminalIcon className="mr-2 h-6 w-6 text-primary" /> Agent Deployment
        </CardTitle>
        <CardDescription>
          Deploy the lightweight VPSight agent to your server using the command below. Replace <code>YOUR_SECRET_CODE</code> with your unique agent key.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="default" className="bg-muted/50">
          <TerminalIcon className="h-5 w-5" />
          <AlertTitle>One-Line Deployment Command</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <code className="text-sm p-2 rounded-md bg-background flex-grow mr-2 my-1 break-all">
              {command}
            </code>
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="mt-2 sm:mt-0">
              <CopyIcon className="mr-2 h-4 w-4" /> Copy
            </Button>
          </AlertDescription>
        </Alert>
        <p className="text-xs text-muted-foreground mt-2">
          The <code>install_agent.sh</code> script will download and configure the agent on your VPS. Ensure you have <code>curl</code> and <code>sudo</code> access.
        </p>
      </CardContent>
    </Card>
  );
}
