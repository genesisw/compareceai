import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import UserLevel from "@/components/gamification/user-level";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckIn } from "@/types";

export default function Profile() {
  const { user } = useAuth();

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
                <p className="text-2xl font-bold">{userStats?.totalCheckIns || 0}</p>
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
                <p className="text-2xl font-bold">{userStats?.points || 0}</p>
                <p className="text-sm text-gray-400">Pontos</p>
              </CardContent>
            </Card>
          </div>

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
                      <div className="w-10 h-10 bg-roxo-magenta rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Check-in realizado</p>
                        <p className="text-sm text-gray-400">
                          {new Date(checkIn.checkinTime).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {checkIn.validated ? (
                        <div className="text-green-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="text-yellow-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                          </svg>
                        </div>
                      )}
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
