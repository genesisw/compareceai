import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import CategoryFilter from "@/components/events/category-filter";
import EventCard from "@/components/events/event-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EventWithDetails } from "@/types";

export default function Events() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events', selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      const response = await fetch(`/api/events?${params}`);
      return response.json() as Promise<EventWithDetails[]>;
    },
  });

  const filteredEvents = events?.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-20">
      <div className="max-w-md mx-auto">
        <Header />
        
        <div className="p-4 bg-dark-card space-y-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-roxo-magenta" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-dark-surface border-0 text-white placeholder-gray-400"
            />
          </div>
          
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <main className="p-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              {searchTerm ? `Resultados para "${searchTerm}"` : 
               selectedCategory ? `Eventos de ${selectedCategory}` : 'Todos os eventos'}
            </h3>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="bg-dark-card border-0">
                    <CardContent className="p-4">
                      <div className="animate-pulse">
                        <div className="bg-gray-600 h-48 rounded-2xl mb-4"></div>
                        <div className="bg-gray-600 h-6 rounded mb-2"></div>
                        <div className="bg-gray-600 h-4 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredEvents && filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <Card className="bg-dark-card border-0">
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Nenhum evento encontrado</h3>
                  <p className="text-gray-400">
                    {searchTerm 
                      ? `Não encontramos eventos para "${searchTerm}"`
                      : selectedCategory 
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
