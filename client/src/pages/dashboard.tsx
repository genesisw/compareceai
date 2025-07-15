import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Event } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirect if not authorized
  useEffect(() => {
    if (user && !['SUPER_ADMIN', 'DONO_ESTABELECIMENTO'].includes(user.role)) {
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

  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/dashboard/events'],
    enabled: !!user && ['SUPER_ADMIN', 'DONO_ESTABELECIMENTO'].includes(user.role),
  });

  if (!user || !['SUPER_ADMIN', 'DONO_ESTABELECIMENTO'].includes(user.role)) {
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
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="text-sm text-gray-400">
              {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Dono de Estabelecimento'}
            </div>
          </div>

          {/* Redirect button for establishment owners */}
          {user.role === 'DONO_ESTABELECIMENTO' && (
            <Card className="bg-roxo-magenta border-0 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Painel do Estabelecimento</h3>
                    <p className="text-sm text-white/80">Gerencie seus eventos, equipe e configurações</p>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/establishment-admin'}
                    className="bg-white text-roxo-magenta hover:bg-gray-100"
                  >
                    Acessar Painel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-dark-card border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-roxo-magenta rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{events?.length || 0}</p>
                    <p className="text-sm text-gray-400">Eventos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">0</p>
                    <p className="text-sm text-gray-400">Check-ins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <Card className="bg-dark-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Meus Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center text-gray-400">Carregando eventos...</div>
              ) : events && events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event: Event) => (
                    <div key={event.id} className="bg-dark-surface rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{event.title}</h3>
                          <p className="text-sm text-gray-400 mb-2">{event.category}</p>
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-roxo-magenta" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                            </svg>
                            <span className="text-sm text-gray-300">
                              {new Date(event.startDatetime).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-laranja-vibrante text-sm font-semibold">0</div>
                          <div className="text-gray-400 text-xs">confirmados</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <p>Nenhum evento criado ainda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
