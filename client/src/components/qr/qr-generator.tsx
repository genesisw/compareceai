import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface QRGeneratorProps {
  eventId: string;
}

export default function QRGenerator({ eventId }: QRGeneratorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: checkIn, isLoading } = useQuery({
    queryKey: ['/api/user/checkins', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/user/checkins?eventId=${eventId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch check-in');
      }
      const checkIns = await response.json();
      return checkIns.find((ci: any) => ci.eventId === eventId);
    },
    enabled: !!user,
  });

  const generateQRCodeDataURL = (text: string) => {
    // Simple QR code generation using a web service
    const size = 200;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
    return qrCodeUrl;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "O código foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roxo-magenta mx-auto mb-4"></div>
        <p className="text-gray-400">Gerando QR Code...</p>
      </div>
    );
  }

  if (!checkIn) {
    return (
      <div className="text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <p className="text-gray-400">Nenhum check-in encontrado para este evento</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-gray-400 mb-6">Mostre este código na entrada do evento</p>
      
      {/* QR Code */}
      <div className="bg-white p-4 rounded-xl mb-4 inline-block">
        <img 
          src={generateQRCodeDataURL(checkIn.qrCode)}
          alt="QR Code para check-in"
          className="w-32 h-32 mx-auto"
        />
      </div>
      
      <p className="text-sm text-gray-400 mb-6">
        Código: <span className="font-mono text-white">{checkIn.qrCode}</span>
      </p>
      
      <div className="space-y-3">
        <Button
          onClick={() => copyToClipboard(checkIn.qrCode)}
          variant="outline"
          className="w-full border-gray-600 hover:bg-gray-700 text-white"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
          {copied ? 'Copiado!' : 'Copiar Código'}
        </Button>
        
        {checkIn.validated ? (
          <div className="flex items-center justify-center space-x-2 text-green-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="text-sm">Check-in validado</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2 text-yellow-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span className="text-sm">Aguardando validação</span>
          </div>
        )}
      </div>
    </div>
  );
}
