import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { EventWithDetails } from "@/types";

interface EventCardProps {
  event: EventWithDetails;
  featured?: boolean;
}

export default function EventCard({ event, featured = false }: EventCardProps) {
  const eventDate = new Date(event.startDatetime);
  const isToday = eventDate.toDateString() === new Date().toDateString();

  const getCategoryColor = (category: string) => {
    const colors = {
      PAGODE: "from-green-500 to-yellow-500",
      SERTANEJO: "from-yellow-500 to-orange-500",
      TECHNO: "from-purple-500 to-pink-500",
      FUNK: "from-pink-500 to-red-500",
      FORRÓ: "from-orange-500 to-yellow-500",
      ROCK: "from-gray-500 to-black",
      SAMBA: "from-green-500 to-blue-500",
    };
    return colors[category as keyof typeof colors] || "from-roxo-magenta to-laranja-vibrante";
  };

  if (featured) {
    return (
      <Link href={`/event/${event.id}`}>
        <Card className="bg-dark-card border-0 cursor-pointer hover:bg-gray-800 transition-colors">
          <CardContent className="p-0">
            <div className="relative h-48 bg-gradient-to-br from-roxo-magenta to-laranja-vibrante">
              {event.imageUrl ? (
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover opacity-90" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                <span className="text-white font-medium text-sm">{event.category}</span>
              </div>
              {isToday && (
                <div className="absolute bottom-4 right-4 bg-laranja-vibrante px-3 py-1 rounded-full">
                  <span className="text-white font-bold text-sm">HOJE</span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2 text-white">{event.title}</h3>
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-4 h-4 text-roxo-magenta" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span className="text-gray-300">{event.city}</span>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-4 h-4 text-roxo-magenta" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                  <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span className="text-gray-300">
                  {eventDate.toLocaleDateString('pt-BR')} às {eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              {event.stats && (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-laranja-vibrante text-sm font-semibold">
                      {event.stats.reactionCounts.EU_VOU_COMPARECER || 0}
                    </div>
                    <div className="text-gray-400 text-xs">vão comparecer</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-500 text-sm font-semibold">
                      {event.stats.totalCheckedIn}
                    </div>
                    <div className="text-gray-400 text-xs">check-ins</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/event/${event.id}`}>
      <Card className="bg-dark-card border-0 cursor-pointer hover:bg-gray-800 transition-colors">
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className={`w-20 h-20 bg-gradient-to-br ${getCategoryColor(event.category)} rounded-xl flex items-center justify-center`}>
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1 text-white">{event.title}</h4>
              <p className="text-gray-400 text-sm mb-2">{event.city}</p>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-roxo-magenta" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zM4 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H12.42c-.14 0-.25-.11-.25-.25l.03-.12L13.1 11H17l3.6-6H8.21L7 3H4zM7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                <span className="text-gray-300 text-sm">
                  {eventDate.toLocaleDateString('pt-BR')} às {eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-laranja-vibrante text-sm font-semibold">
                {event.stats?.reactionCounts.EU_VOU_COMPARECER || 0}
              </div>
              <div className="text-gray-400 text-xs">vão comparecer</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
