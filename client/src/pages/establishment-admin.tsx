import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building, Users, UserPlus, Crown, Calendar, Settings, BarChart3, Plus, QrCode, Eye } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { EventWithDetails } from "@/types";

export default function EstablishmentAdmin() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  
  // Employee Management
  const [userId, setUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"FUNCIONARIO" | "PROMOTER">("FUNCIONARIO");
  const [isPromoving, setIsPromoving] = useState(false);
  
  // Event Creation
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    category: "",
    startDatetime: "",
    endDatetime: "",
    city: "",
    benefits: ""
  });
  
  // Establishment Settings
  const [establishmentSettings, setEstablishmentSettings] = useState({
    name: "",
    description: "",
    city: "",
    state: "",
    phone: "",
    openingHours: "",
    category: ""
  });

  // Data fetching
  const { data: establishment } = useQuery({
    queryKey: ['/api/establishment/current'],
    enabled: user?.role === 'DONO_ESTABELECIMENTO'
  });

  const { data: events = [] } = useQuery({
    queryKey: ['/api/establishment/events'],
    enabled: user?.role === 'DONO_ESTABELECIMENTO'
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['/api/establishment/staff'],
    enabled: user?.role === 'DONO_ESTABELECIMENTO'
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/establishment/stats'],
    enabled: user?.role === 'DONO_ESTABELECIMENTO'
  });

  // Mutations for actions
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest("POST", "/api/establishment/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Evento criado com sucesso.",
      });
      setEventData({
        title: "",
        description: "",
        category: "",
        startDatetime: "",
        endDatetime: "",
        city: "",
        benefits: ""
      });
      queryClient.invalidateQueries({ queryKey: ['/api/establishment/events'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao criar evento",
        variant: "destructive",
      });
    }
  });

  const updateEstablishmentMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest("PUT", "/api/establishment/settings", settings);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Configurações atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/establishment/current'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar configurações",
        variant: "destructive",
      });
    }
  });

  const handlePromoteEmployee = async () => {
    if (!userId.trim()) return;
    
    setIsPromoving(true);
    try {
      await apiRequest("POST", `/api/establishment/promote/${userId}`, {
        role: selectedRole
      });
      
      toast({
        title: "Sucesso!",
        description: `Usuário ${userId} promovido para ${selectedRole === 'FUNCIONARIO' ? 'Funcionário' : 'Promoter'}.`,
      });
      
      setUserId("");
      queryClient.invalidateQueries({ queryKey: ['/api/establishment/staff'] });
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

  const handleCreateEvent = async () => {
    if (!eventData.title || !eventData.category || !eventData.startDatetime) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    createEventMutation.mutate(eventData);
  };

  const handleUpdateSettings = async () => {
    updateEstablishmentMutation.mutate(establishmentSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user?.role !== 'DONO_ESTABELECIMENTO') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Acesso Negado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Você precisa ser um Dono de Estabelecimento para acessar esta página.
              </p>
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
            <Building className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">Gerenciar Estabelecimento</h1>
          </div>
          <p className="text-muted-foreground">
            Promova funcionários e promoters para sua equipe
          </p>
        </div>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Informações do Dono
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">ID do Usuário</Label>
                <p className="text-sm text-muted-foreground font-mono">{user?.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Role</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default">DONO_ESTABELECIMENTO</Badge>
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
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciar Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Promover Funcionário
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione funcionários à sua equipe para validar check-ins e ajudar na operação.
              </p>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">ID do Usuário</Label>
                  <Input
                    placeholder="ID do usuário (ex: 12345678)"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Função</Label>
                  <Select value={selectedRole} onValueChange={(value: "FUNCIONARIO" | "PROMOTER") => setSelectedRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FUNCIONARIO">Funcionário</SelectItem>
                      <SelectItem value="PROMOTER">Promoter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handlePromoteEmployee} 
                  disabled={isPromoving || !userId.trim()}
                  className="w-full"
                >
                  {isPromoving ? "Promovendo..." : `Promover para ${selectedRole === 'FUNCIONARIO' ? 'Funcionário' : 'Promoter'}`}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">ℹ️ Sobre as Funções</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <div>
                  <strong>Funcionário:</strong> Pode validar check-ins via QR code e ajudar na operação dos eventos.
                </div>
                <div>
                  <strong>Promoter:</strong> Pode criar links promocionais e atrair público para os eventos.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}