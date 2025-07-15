import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Users, Database, Crown } from "lucide-react";

export default function Admin() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [userId, setUserId] = useState("");
  const [isPromoving, setIsPromoving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleAutoPromote = async () => {
    if (!user?.id) return;
    
    setIsPromoving(true);
    try {
      await apiRequest("POST", "/api/admin/auto-promote", { userId: user.id });
      
      toast({
        title: "Sucesso!",
        description: "Você foi promovido a Super Admin e o banco foi populado com eventos de exemplo.",
      });
      
      // Refresh the page after success
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao promover usuário",
        variant: "destructive",
      });
    } finally {
      setIsPromoving(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await apiRequest("POST", "/api/admin/seed");
      
      toast({
        title: "Sucesso!",
        description: "Base de dados populada com eventos de exemplo.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao popular banco de dados",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handlePromoteUser = async () => {
    if (!userId.trim()) return;
    
    setIsPromoving(true);
    try {
      await apiRequest("POST", `/api/admin/promote/${userId}`, {
        role: 'DONO_ESTABELECIMENTO'
      });
      
      toast({
        title: "Sucesso!",
        description: `Usuário ${userId} promovido a Dono de Estabelecimento.`,
      });
      
      setUserId("");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao promover usuário",
        variant: "destructive",
      });
    } finally {
      setIsPromoving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show login button if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Admin Panel - Login Necessário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Faça login para acessar o painel administrativo.
              </p>
              <Button onClick={() => window.location.href = '/api/login'} className="w-full">
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">
            Painel administrativo do Comparece.ai
          </p>
        </div>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informações do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">ID do Usuário</Label>
                <p className="text-sm text-muted-foreground font-mono">{user?.id || "Não logado"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Role Atual</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={user?.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                    {user?.role || "USUARIO"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <p className="text-sm text-muted-foreground">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : "Nome não disponível"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{user?.email || "Email não disponível"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Setup */}
        {user?.email === 'luiscpaim@gmail.com' && user?.role !== 'SUPER_ADMIN' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuração Rápida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Primeira Configuração</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Clique no botão abaixo para se tornar Super Admin e popular o banco com eventos de exemplo.
                </p>
                <Button 
                  onClick={handleAutoPromote} 
                  disabled={isPromoving}
                  className="w-full"
                >
                  {isPromoving ? "Configurando..." : "Configurar Admin + Eventos"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Access Restriction Message */}
        {user?.email !== 'luiscpaim@gmail.com' && user?.role !== 'SUPER_ADMIN' && user?.role !== 'DONO_ESTABELECIMENTO' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Acesso Restrito
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Permissões Necessárias</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você precisa ser promovido pelo Super Admin para acessar as funcionalidades administrativas.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Papéis disponíveis:</strong></p>
                  <ul className="ml-4 mt-2 space-y-1">
                    <li>• <strong>DONO_ESTABELECIMENTO</strong> - Gerenciar seus estabelecimentos e eventos</li>
                    <li>• <strong>FUNCIONARIO</strong> - Validar check-ins e gerenciar eventos</li>
                    <li>• <strong>PROMOTER</strong> - Criar links promocionais</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Actions */}
        {user?.role === 'SUPER_ADMIN' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Gerenciar Banco de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Button 
                      onClick={handleSeedDatabase} 
                      disabled={isSeeding}
                      variant="outline"
                      className="w-full"
                    >
                      {isSeeding ? "Populando..." : "Popular com Eventos"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Promover Usuário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">📋 Como Encontrar o ID do Usuário</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Usuário deve fazer login primeiro na plataforma</li>
                    <li>• O ID aparece no topo do perfil (número como 45077607)</li>
                    <li>• <strong>NÃO é o email</strong> - é o ID numérico do Replit</li>
                    <li>• Exemplo: digite <code>45077607</code> para promover digitalsimetria@gmail.com</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="userId">ID do Usuário</Label>
                  <Input
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Digite o ID numérico (ex: 45077607)"
                  />
                </div>
                <Button 
                  onClick={handlePromoteUser} 
                  disabled={isPromoving || !userId.trim()}
                  className="w-full"
                >
                  {isPromoving ? "Promovendo..." : "Promover a Dono de Estabelecimento"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h3 className="font-semibold">Como usar o Admin Panel:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Faça login com sua conta Replit</li>
                <li>• Use "Configurar Admin + Eventos" para primeira configuração</li>
                <li>• Acesse o Dashboard após ser promovido</li>
                <li>• Gerencie eventos e estabelecimentos pelo painel</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold">Funcionalidades do Sistema:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Gerenciar eventos e estabelecimentos</li>
                <li>• Validar check-ins via QR Code</li>
                <li>• Acompanhar estatísticas de engajamento</li>
                <li>• Sistema de gamificação com níveis</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}