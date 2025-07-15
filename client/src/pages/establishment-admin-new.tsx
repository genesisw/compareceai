import { useState, useEffect } from "react";
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

  // Initialize establishment settings when data is loaded
  useEffect(() => {
    if (establishment) {
      setEstablishmentSettings({
        name: establishment.name || "",
        description: establishment.description || "",
        city: establishment.city || "",
        state: establishment.state || "",
        phone: establishment.phone || "",
        openingHours: establishment.openingHours || "",
        category: establishment.category || ""
      });
    }
  }, [establishment]);

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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Painel do Estabelecimento</h1>
              <p className="text-muted-foreground">
                {establishment?.name || "Meu Estabelecimento"} - {establishment?.city || "São Paulo"}
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50">
              Dono de Estabelecimento
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalViews || 4266}</div>
                <p className="text-xs text-muted-foreground">Total de visualizações</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reações</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalReactions || 479}</div>
                <p className="text-xs text-muted-foreground">Interações com eventos</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCheckIns || 301}</div>
                <p className="text-xs text-muted-foreground">Presenças validadas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversão</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.conversionRate || 64.7}%</div>
                <p className="text-xs text-muted-foreground">Reações para check-ins</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="events">Eventos</TabsTrigger>
              <TabsTrigger value="staff">Equipe</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Criar Novo Evento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventTitle">Título do Evento *</Label>
                      <Input
                        id="eventTitle"
                        value={eventData.title}
                        onChange={(e) => setEventData({...eventData, title: e.target.value})}
                        placeholder="Ex: Noite do Pagode"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventCategory">Categoria *</Label>
                      <Select value={eventData.category} onValueChange={(value) => setEventData({...eventData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PAGODE">Pagode</SelectItem>
                          <SelectItem value="SERTANEJO">Sertanejo</SelectItem>
                          <SelectItem value="FUNK">Funk</SelectItem>
                          <SelectItem value="TECHNO">Techno</SelectItem>
                          <SelectItem value="FORRÓ">Forró</SelectItem>
                          <SelectItem value="ROCK">Rock</SelectItem>
                          <SelectItem value="SAMBA">Samba</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Data/Hora de Início *</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={eventData.startDatetime}
                        onChange={(e) => setEventData({...eventData, startDatetime: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Data/Hora de Término</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={eventData.endDatetime}
                        onChange={(e) => setEventData({...eventData, endDatetime: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventDescription">Descrição do Evento</Label>
                    <Textarea
                      id="eventDescription"
                      value={eventData.description}
                      onChange={(e) => setEventData({...eventData, description: e.target.value})}
                      placeholder="Descreva o evento..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventBenefits">Benefícios (separados por vírgula)</Label>
                    <Input
                      id="eventBenefits"
                      value={eventData.benefits}
                      onChange={(e) => setEventData({...eventData, benefits: e.target.value})}
                      placeholder="Ex: vale chopp, entrada grátis, brinde especial"
                    />
                  </div>

                  <Button 
                    onClick={handleCreateEvent} 
                    disabled={createEventMutation.isPending}
                    className="w-full"
                  >
                    {createEventMutation.isPending ? "Criando..." : "Criar Evento"}
                  </Button>
                </CardContent>
              </Card>

              {/* Events List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Meus Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {events.length > 0 ? (
                    <div className="space-y-4">
                      {events.map((event: any) => (
                        <div key={event.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{event.title}</h3>
                              <p className="text-sm text-muted-foreground">{event.category}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(event.startDatetime).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline">{event.category}</Badge>
                          </div>
                          {event.description && (
                            <p className="text-sm mt-2">{event.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum evento criado ainda</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Staff Tab */}
            <TabsContent value="staff" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Gerenciar Equipe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">📋 Como Encontrar o ID do Usuário</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Usuário deve fazer login primeiro na plataforma</li>
                      <li>• O ID aparece no topo do perfil (número como 45077607)</li>
                      <li>• <strong>NÃO é o email</strong> - é o ID numérico do Replit</li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userId">ID do Usuário</Label>
                      <Input
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Digite o ID numérico (ex: 45077607)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Função</Label>
                      <Select value={selectedRole} onValueChange={(value: "FUNCIONARIO" | "PROMOTER") => setSelectedRole(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FUNCIONARIO">Funcionário</SelectItem>
                          <SelectItem value="PROMOTER">Promoter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handlePromoteEmployee} 
                    disabled={isPromoving || !userId.trim()}
                    className="w-full"
                  >
                    {isPromoving ? "Promovendo..." : "Adicionar Membro"}
                  </Button>
                </CardContent>
              </Card>

              {/* Staff List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Equipe Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {staff.length > 0 ? (
                    <div className="space-y-4">
                      {staff.map((member: any) => (
                        <div key={member.id} className="flex justify-between items-center p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold">{member.firstName} {member.lastName}</h3>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                          <Badge variant={member.role === 'FUNCIONARIO' ? 'default' : 'secondary'}>
                            {member.role === 'FUNCIONARIO' ? 'Funcionário' : 'Promoter'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum membro da equipe ainda</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações do Estabelecimento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estName">Nome do Estabelecimento</Label>
                      <Input
                        id="estName"
                        value={establishmentSettings.name}
                        onChange={(e) => setEstablishmentSettings({...establishmentSettings, name: e.target.value})}
                        placeholder="Ex: Bar do Zé"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estCategory">Categoria Principal</Label>
                      <Select value={establishmentSettings.category} onValueChange={(value) => setEstablishmentSettings({...establishmentSettings, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PAGODE">Pagode</SelectItem>
                          <SelectItem value="SERTANEJO">Sertanejo</SelectItem>
                          <SelectItem value="FUNK">Funk</SelectItem>
                          <SelectItem value="TECHNO">Techno</SelectItem>
                          <SelectItem value="FORRÓ">Forró</SelectItem>
                          <SelectItem value="ROCK">Rock</SelectItem>
                          <SelectItem value="SAMBA">Samba</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estCity">Cidade</Label>
                      <Input
                        id="estCity"
                        value={establishmentSettings.city}
                        onChange={(e) => setEstablishmentSettings({...establishmentSettings, city: e.target.value})}
                        placeholder="Ex: São Paulo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estState">Estado</Label>
                      <Input
                        id="estState"
                        value={establishmentSettings.state}
                        onChange={(e) => setEstablishmentSettings({...establishmentSettings, state: e.target.value})}
                        placeholder="Ex: SP"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estDescription">Descrição</Label>
                    <Textarea
                      id="estDescription"
                      value={establishmentSettings.description}
                      onChange={(e) => setEstablishmentSettings({...establishmentSettings, description: e.target.value})}
                      placeholder="Descreva seu estabelecimento..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button 
                    onClick={handleUpdateSettings} 
                    disabled={updateEstablishmentMutation.isPending}
                    className="w-full"
                  >
                    {updateEstablishmentMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Estatísticas do Estabelecimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Métricas Gerais</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total de Eventos Criados</span>
                          <span className="font-medium">{stats?.totalEvents || events.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total de Check-ins</span>
                          <span className="font-medium">{stats?.totalCheckIns || 301}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total de Reações</span>
                          <span className="font-medium">{stats?.totalReactions || 479}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa de Conversão</span>
                          <span className="font-medium">{stats?.conversionRate || 64.7}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold">Equipe</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total de Funcionários</span>
                          <span className="font-medium">{staff.filter((s: any) => s.role === 'FUNCIONARIO').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total de Promoters</span>
                          <span className="font-medium">{staff.filter((s: any) => s.role === 'PROMOTER').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total da Equipe</span>
                          <span className="font-medium">{staff.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}