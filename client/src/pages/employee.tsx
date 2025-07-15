import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import QRScanner from "@/components/qr/qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Employee() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [manualCode, setManualCode] = useState("");
  const [scannerActive, setScannerActive] = useState(false);

  // Redirect if not authorized
  useEffect(() => {
    if (user && !['SUPER_ADMIN', 'DONO_ESTABELECIMENTO', 'FUNCIONARIO'].includes(user.role)) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [user, toast]);

  const validateMutation = useMutation({
    mutationFn: async (qrCode: string) => {
      const response = await apiRequest('POST', '/api/checkins/validate', { qrCode });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Check-in validado!",
        description: "O check-in foi validado com sucesso.",
      });
      setManualCode("");
      setScannerActive(false);
    },
    onError: (error) => {
      toast({
        title: "Erro na validação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleManualValidation = () => {
    if (!manualCode.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, digite o código do cliente.",
        variant: "destructive",
      });
      return;
    }
    validateMutation.mutate(manualCode.trim());
  };

  if (!user || !['SUPER_ADMIN', 'DONO_ESTABELECIMENTO', 'FUNCIONARIO'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-dark-bg text-white">
        <div className="max-w-md mx-auto">
          <Header />
          <div className="p-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso negado</h1>
            <p className="text-gray-400">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-20">
      <div className="max-w-md mx-auto">
        <Header />
        
        <main className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Validação de Check-in</h1>
            <div className="text-sm text-gray-400">Funcionário</div>
          </div>

          {/* QR Scanner */}
          <Card className="bg-dark-card border-0">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <svg className="w-6 h-6 text-laranja-vibrante" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6.5 9.5v3h-3v-3h3M19 13h-6v6h6v-6zM6.5 7.5H8v1H6.5V7.5zm0 9H8v1H6.5v-1zM13.5 7.5H15v1h-1.5V7.5zm0 9H15v1h-1.5v-1z"/>
                </svg>
                <span>Escanear QR Code</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-gray-400 mb-4">Aponte a câmera para o código do cliente</p>
                
                {scannerActive ? (
                  <div className="space-y-4">
                    <QRScanner
                      onScan={(code) => {
                        validateMutation.mutate(code);
                        setScannerActive(false);
                      }}
                      onError={(error) => {
                        toast({
                          title: "Erro no scanner",
                          description: error,
                          variant: "destructive",
                        });
                      }}
                    />
                    <Button
                      onClick={() => setScannerActive(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Parar Scanner
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-black rounded-xl h-48 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6.5 9.5v3h-3v-3h3M19 13h-6v6h6v-6zM6.5 7.5H8v1H6.5V7.5zm0 9H8v1H6.5v-1zM13.5 7.5H15v1h-1.5V7.5zm0 9H15v1h-1.5v-1z"/>
                      </svg>
                    </div>
                    
                    <Button
                      onClick={() => setScannerActive(true)}
                      className="w-full bg-roxo-magenta hover:bg-roxo-escuro text-white py-3 rounded-xl font-semibold"
                    >
                      Ativar Câmera
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Manual Validation */}
          <Card className="bg-dark-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Validação Manual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Digite o código do cliente"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="bg-dark-surface border-0 text-white placeholder-gray-400"
                />
                <Button
                  onClick={handleManualValidation}
                  disabled={validateMutation.isPending}
                  className="w-full bg-laranja-vibrante hover:bg-orange-600 text-white py-3 rounded-xl font-semibold"
                >
                  {validateMutation.isPending ? 'Validando...' : 'Validar Check-in'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-dark-card border-0">
            <CardContent className="p-6">
              <h3 className="font-semibold text-white mb-4">Instruções:</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="text-roxo-magenta">1.</span>
                  <span>Use o scanner para ler o QR Code mostrado pelo cliente</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-roxo-magenta">2.</span>
                  <span>Ou digite manualmente o código se necessário</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-roxo-magenta">3.</span>
                  <span>Após validar, o cliente pode usufruir dos benefícios</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
