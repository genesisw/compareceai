import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import UserLevel from "@/components/gamification/user-level";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckIn } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: userStats } = useQuery({
    queryKey: ['/api/user/stats'],
  });

  const { data: checkIns } = useQuery({
    queryKey: ['/api/user/checkins'],
    queryFn: async () => {
      const response = await fetch('/api/user/checkins');
      return response.json() as Promise<CheckIn[]>;
    },
  });

  // Mutation para criar check-in de teste
  const createTestCheckIn = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/checkins', {
        eventId: 'test-event-id',
        promoterId: null,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Check-in criado!",
        description: "Check-in de teste criado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/checkins'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email?.split('@')[0] || 'Usuário';
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-20">
      <div className="max-w-md mx-auto">
        <Header />
        
        <main className="p-4 space-y-6">
          {/* Profile Header */}
          <Card className="bg-dark-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.profileImageUrl || ''} />
                  <AvatarFallback className="bg-roxo-magenta text-white text-lg">
                    {getUserDisplayName() ? getInitials(getUserDisplayName()) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">{getUserDisplayName()}</h2>
                  <p className="text-gray-400">{user?.email}</p>
                  <p className="text-xs text-gray-500">ID: {user?.id}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Online</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Level */}
          {userStats && (
            <UserLevel userStats={userStats} />
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-dark-card border-0">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">{userStats?.totalCheckIns || 0}</p>
                <p className="text-sm text-gray-400">Check-ins totais</p>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-0">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-laranja-vibrante rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">{userStats?.points || 0}</p>
                <p className="text-sm text-gray-400">Pontos</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Stats */}
          <Card className="bg-dark-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Este Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-roxo-magenta rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H19v2h-2V2h-3v2H8V2H5v2H3.5A1.5 1.5 0 002 5.5v13A1.5 1.5 0 003.5 20h15a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0018.5 2zM18 18H4V8h14v10z"/>
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-white">{userStats?.monthlyCheckIns || 0}</p>
                  <p className="text-xs text-gray-400">Check-ins</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {checkIns ? checkIns.filter(c => c.validated).length : 0}
                  </p>
                  <p className="text-xs text-gray-400">Validados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Check-in Button */}
          <Card className="bg-dark-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Teste de Check-in</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => createTestCheckIn.mutate()}
                disabled={createTestCheckIn.isPending}
                className="w-full bg-roxo-magenta hover:bg-purple-600 text-white"
              >
                {createTestCheckIn.isPending ? 'Criando...' : 'Criar Check-in de Teste'}
              </Button>
              <p className="text-sm text-gray-400 mt-2">
                Clique para simular um check-in e ver como os dados aparecem
              </p>
            </CardContent>
          </Card>

          {/* Recent Check-ins */}
          <Card className="bg-dark-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Check-ins Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {checkIns && checkIns.length > 0 ? (
                <div className="space-y-4">
                  {checkIns.slice(0, 5).map((checkIn) => (
                    <div key={checkIn.id} className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        checkIn.validated ? 'bg-green-500' : 'bg-roxo-magenta'
                      }`}>
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">
                          {checkIn.validated ? 'Check-in validado' : 'Check-in realizado'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(checkIn.checkinTime).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })} às {new Date(checkIn.checkinTime).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        {checkIn.validated ? (
                          <div className="text-green-500 text-sm font-semibold">
                            +5 pontos
                          </div>
                        ) : (
                          <div className="text-yellow-500 text-sm">
                            Pendente
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <p>Nenhum check-in ainda</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logout Button */}
          <Button
            onClick={() => window.location.href = '/api/logout'}
            variant="outline"
            className="w-full py-3 text-white border-gray-600 hover:bg-gray-700"
          >
            Sair da conta
          </Button>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
