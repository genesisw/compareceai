import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (code: string) => void;
  onError: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsScanning(true);
    } catch (err) {
      onError('Erro ao acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  // Simulated QR code scanning - in a real app, you'd use a QR code library
  const simulateQRScan = () => {
    // For demonstration, we'll simulate finding a QR code
    const mockQRCode = `QR_${Date.now()}`;
    onScan(mockQRCode);
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-48 bg-black rounded-xl object-cover"
      />
      
      {/* QR Code scanning overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="border-2 border-white border-dashed w-32 h-32 rounded-lg">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-roxo-magenta"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-roxo-magenta"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-roxo-magenta"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-roxo-magenta"></div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="text-center mt-4">
        <p className="text-gray-400 text-sm mb-4">
          Posicione o QR Code dentro da área indicada
        </p>
        
        {isScanning && (
          <Button
            onClick={simulateQRScan}
            className="bg-roxo-magenta hover:bg-roxo-escuro text-white px-6 py-2 rounded-lg"
          >
            Simular Scan (Demo)
          </Button>
        )}
      </div>
      
      {/* Status indicator */}
      <div className="flex items-center justify-center mt-2">
        <div className={`w-2 h-2 rounded-full mr-2 ${isScanning ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm text-gray-400">
          {isScanning ? 'Câmera ativa' : 'Câmera inativa'}
        </span>
      </div>
    </div>
  );
}
