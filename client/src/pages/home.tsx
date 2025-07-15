import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import CategoryFilter from "@/components/events/category-filter";
import EventCard from "@/components/events/event-card";
import UserLevel from "@/components/gamification/user-level";
import { Card, CardContent } from "@/components/ui/card";
import { EventWithDetails } from "@/types";
import { useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events', selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      const response = await fetch(`/api/events?${params}`);
      return response.json() as Promise<EventWithDetails[]>;
    },
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/user/stats'],
  });

  if (eventsLoading) {
    return (
      <div className="min-h-screen bg-dark-bg text-white">
        <div className="max-w-md mx-auto">
          <Header />
          <div className="p-4 flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roxo-magenta mx-auto mb-4"></div>
              <p className="text-gray-400">Carregando eventos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-20">
      <div className="max-w-md mx-auto">
        <Header />
        
        <div className="p-4 bg-dark-card">
          <h2 className="text-white font-semibold mb-3">Onde vou comparecer?</h2>
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <main className="p-4 space-y-6">
          {userStats && (
            <UserLevel userStats={userStats} />
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              {selectedCategory ? `Eventos de ${selectedCategory}` : 'Todos os eventos'}
            </h3>
            
            {events && events.length > 0 ? (
              events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <Card className="bg-dark-card border-0">
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Nenhum evento encontrado</h3>
                  <p className="text-gray-400">
                    {selectedCategory 
                      ? `Não há eventos de ${selectedCategory} no momento`
                      : 'Não há eventos disponíveis no momento'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
