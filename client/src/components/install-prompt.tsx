import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export default function InstallPrompt() {
  const { isInstallable, installApp, isInstalled } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  console.log('InstallPrompt state:', { isInstallable, isInstalled, dismissed });

  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-dark-card border-roxo-magenta/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Download className="h-5 w-5 text-roxo-magenta" />
            Instalar Comparece.ai
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-gray-300">
          Instale o app para uma experiência mais rápida e notificações de novos eventos!
        </CardDescription>
      </CardHeader>
      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button
            onClick={() => {
              console.log('Install button clicked');
              installApp();
            }}
            className="flex-1 bg-roxo-magenta hover:bg-roxo-magenta/90 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Instalar
          </Button>
          <Button
            variant="outline"
            onClick={() => setDismissed(true)}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Agora não
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}