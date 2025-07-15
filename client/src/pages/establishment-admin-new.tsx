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
import { Building, Users, UserPlus, Crown, Calendar, Settings, BarChart3, Plus, QrCode, Eye, TrendingUp, CheckCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { EventWithDetails } from "@/types";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";

export default function EstablishmentAdminNew() {
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
    category: "PAGODE",
    startDatetime: "",
    endDatetime: "",
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

  // Employee promotion mutation
  const promoteUserMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
      const response = await apiRequest("POST", `/api/establishment/promote/${userId}`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Usuário promovido com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/establishment/staff'] });
      setUserId("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao promover usuário",
        variant: "destructive",
      });
    },
  });

  // Event creation mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest("POST", "/api/establishment/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Evento criado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/establishment/events'] });
      setEventData({
        title: "",
        description: "",
        category: "PAGODE",
        startDatetime: "",
        endDatetime: "",
        benefits: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar evento",
        variant: "destructive",
      });
    },
  });

  // Update establishment mutation
  const updateEstablishmentMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest("PUT", "/api/establishment/settings", settings);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Configurações atualizadas com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/establishment/current'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar configurações",
        variant: "destructive",
      });
    },
  });

  const handlePromoteUser = async () => {
    if (!userId.trim()) {
      toast({
        title: "Erro",
        description: "Digite o ID do usuário",
        variant: "destructive",
      });
      return;
    }

    setIsPromoving(true);
    try {
      await promoteUserMutation.mutateAsync({ userId, role: selectedRole });
    } finally {
      setIsPromoving(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventData.title || !eventData.startDatetime || !eventData.category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    await createEventMutation.mutateAsync(eventData);
  };

  const handleUpdateSettings = async () => {
    await updateEstablishmentMutation.mutateAsync(establishmentSettings);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roxo-magenta mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'DONO_ESTABELECIMENTO') {
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
        
        <main className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Painel do Estabelecimento</h1>
            <Badge variant="outline" className="border-roxo-magenta text-roxo-magenta">
              <Building className="w-4 h-4 mr-1" />
              Dono
            </Badge>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-dark-card border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-roxo-magenta rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalEvents || 0}</p>
                    <p className="text-sm text-gray-400">Eventos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalCheckIns || 0}</p>
                    <p className="text-sm text-gray-400">Check-ins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="events" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-dark-card">
              <TabsTrigger value="events" className="text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                Eventos
              </TabsTrigger>
              <TabsTrigger value="team" className="text-sm">
                <Users className="w-4 h-4 mr-1" />
                Equipe
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-sm">
                <Settings className="w-4 h-4 mr-1" />
                Config
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-sm">
                <BarChart3 className="w-4 h-4 mr-1" />
                Stats
              </TabsTrigger>
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-4">
              <Card className="bg-dark-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Novo Evento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título do Evento</Label>
                    <Input
                      id="title"
                      value={eventData.title}
                      onChange={(e) => setEventData({...eventData, title: e.target.value})}
                      placeholder="Ex: Noite do Pagode"
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-roxo-magenta focus:ring-roxo-magenta"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={eventData.description}
                      onChange={(e) => setEventData({...eventData, description: e.target.value})}
                      placeholder="Descrição do evento..."
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-roxo-magenta focus:ring-roxo-magenta"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={eventData.category} onValueChange={(value) => setEventData({...eventData, category: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-roxo-magenta focus:ring-roxo-magenta">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PAGODE">Pagode</SelectItem>
                        <SelectItem value="SERTANEJO">Sertanejo</SelectItem>
                        <SelectItem value="FUNK">Funk</SelectItem>
                        <SelectItem value="ROCK">Rock</SelectItem>
                        <SelectItem value="TECHNO">Techno</SelectItem>
                        <SelectItem value="FORRÓ">Forró</SelectItem>
                        <SelectItem value="SAMBA">Samba</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="startDatetime">Data e Hora de Início</Label>
                    <Input
                      id="startDatetime"
                      type="datetime-local"
                      value={eventData.startDatetime}
                      onChange={(e) => setEventData({...eventData, startDatetime: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white focus:border-roxo-magenta focus:ring-roxo-magenta [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="endDatetime">Data e Hora de Fim (opcional)</Label>
                    <Input
                      id="endDatetime"
                      type="datetime-local"
                      value={eventData.endDatetime}
                      onChange={(e) => setEventData({...eventData, endDatetime: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white focus:border-roxo-magenta focus:ring-roxo-magenta [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="benefits">Benefícios/Incentivos</Label>
                    <Textarea
                      id="benefits"
                      value={eventData.benefits}
                      onChange={(e) => setEventData({...eventData, benefits: e.target.value})}
                      placeholder="Ex: Desconto de 20% em bebidas, entrada gratuita até 23h..."
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-roxo-magenta focus:ring-roxo-magenta"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCreateEvent}
                    disabled={createEventMutation.isPending}
                    className="w-full bg-roxo-magenta hover:bg-roxo-magenta/90"
                  >
                    {createEventMutation.isPending ? "Criando..." : "Criar Evento"}
                  </Button>
                </CardContent>
              </Card>

              {/* Events List */}
              <Card className="bg-dark-card border-0">
                <CardHeader>
                  <CardTitle>Meus Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum evento criado ainda</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events.map((event: any) => (
                        <div key={event.id} className="p-3 bg-dark-bg rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{event.title}</h3>
                              <p className="text-sm text-gray-400">{event.category}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(event.startDatetime).toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-roxo-magenta text-roxo-magenta">
                              {event.category}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-4">
              <Card className="bg-dark-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Promover Usuário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="userId">ID do Usuário</Label>
                    <Input
                      id="userId"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Digite o ID do usuário"
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-roxo-magenta focus:ring-roxo-magenta"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Função</Label>
                    <Select value={selectedRole} onValueChange={(value: "FUNCIONARIO" | "PROMOTER") => setSelectedRole(value)}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-roxo-magenta focus:ring-roxo-magenta">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FUNCIONARIO">Funcionário (Validação QR)</SelectItem>
                        <SelectItem value="PROMOTER">Promoter (Links personalizados)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={handlePromoteUser}
                    disabled={isPromoving}
                    className="w-full bg-roxo-magenta hover:bg-roxo-magenta/90"
                  >
                    {isPromoving ? "Promovendo..." : "Promover Usuário"}
                  </Button>
                </CardContent>
              </Card>

              {/* Staff List */}
              <Card className="bg-dark-card border-0">
                <CardHeader>
                  <CardTitle>Equipe</CardTitle>
                </CardHeader>
                <CardContent>
                  {staff.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum funcionário ou promoter ainda</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {staff.map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
                          <div>
                            <h3 className="font-semibold">{member.firstName || member.email}</h3>
                            <p className="text-sm text-gray-400">{member.email}</p>
                          </div>
                          <Badge variant="outline" className={
                            member.role === 'FUNCIONARIO' ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500'
                          }>
                            {member.role === 'FUNCIONARIO' ? 'Funcionário' : 'Promoter'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-dark-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Configurações do Estabelecimento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Estabelecimento</Label>
                    <Input
                      id="name"
                      value={establishmentSettings.name}
                      onChange={(e) => setEstablishmentSettings({...establishmentSettings, name: e.target.value})}
                      placeholder="Nome do seu estabelecimento"
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-roxo-magenta focus:ring-roxo-magenta"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={establishmentSettings.description}
                      onChange={(e) => setEstablishmentSettings({...establishmentSettings, description: e.target.value})}
                      placeholder="Descrição do estabelecimento..."
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-roxo-magenta focus:ring-roxo-magenta"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={establishmentSettings.city}
                        onChange={(e) => setEstablishmentSettings({...establishmentSettings, city: e.target.value})}
                        placeholder="Cidade"
                        className="bg-dark-bg border-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={establishmentSettings.state}
                        onChange={(e) => setEstablishmentSettings({...establishmentSettings, state: e.target.value})}
                        placeholder="Estado"
                        className="bg-dark-bg border-gray-700"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={establishmentSettings.phone}
                      onChange={(e) => setEstablishmentSettings({...establishmentSettings, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      className="bg-dark-bg border-gray-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="openingHours">Horário de Funcionamento</Label>
                    <Input
                      id="openingHours"
                      value={establishmentSettings.openingHours}
                      onChange={(e) => setEstablishmentSettings({...establishmentSettings, openingHours: e.target.value})}
                      placeholder="Ex: Seg-Dom 18h-04h"
                      className="bg-dark-bg border-gray-700"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleUpdateSettings}
                    disabled={updateEstablishmentMutation.isPending}
                    className="w-full bg-roxo-magenta hover:bg-roxo-magenta/90"
                  >
                    {updateEstablishmentMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-dark-card border-0">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-roxo-magenta">{stats?.totalEvents || 0}</div>
                    <div className="text-sm text-gray-400">Total de Eventos</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-card border-0">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">{stats?.totalCheckIns || 0}</div>
                    <div className="text-sm text-gray-400">Check-ins</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-card border-0">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500">{stats?.totalStaff || 0}</div>
                    <div className="text-sm text-gray-400">Funcionários</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-card border-0">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-500">{stats?.totalPromoters || 0}</div>
                    <div className="text-sm text-gray-400">Promoters</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-dark-card border-0">
                <CardHeader>
                  <CardTitle>Estatísticas Detalhadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Visualizações:</span>
                    <span className="font-semibold">{Math.round(stats?.totalViews || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Reações:</span>
                    <span className="font-semibold">{stats?.totalReactions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Taxa de Conversão:</span>
                    <span className="font-semibold">{stats?.conversionRate || 0}%</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        
        <BottomNav />
      </div>
    </div>
  );
}