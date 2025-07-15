import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import ReactionButtons from "@/components/events/reaction-buttons";
import QRGenerator from "@/components/qr/qr-generator";
import IncentiveCard from "@/components/incentives/incentive-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventWithDetails, UserReaction } from "@/types";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showQRCode, setShowQRCode] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ['/api/events', id],
    queryFn: async () => {
      const response = await fetch(`/api/events/${id}`);
      return response.json() as Promise<EventWithDetails>;
    },
  });

  const { data: userReaction } = useQuery({
    queryKey: ['/api/events', id, 'user-reaction'],
    queryFn: async () => {
      const response = await fetch(`/api/events/${id}/reactions`);
      const reactions = await response.json() as UserReaction[];
      return reactions.find(r => r.userId === user?.id);
    },
    enabled: !!user,
  });

  const reactionMutation = useMutation({
    mutationFn: async (reaction: string) => {
      await apiRequest('POST', `/api/events/${id}/react`, { reaction });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', id, 'user-reaction'] });
      toast({
        title: "Reação registrada!",
        description: "Sua reação foi salva com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/events/${id}/checkin`, {});
      return response.json();
    },
    onSuccess: () => {
      setShowQRCode(true);
      toast({
        title: "Check-in realizado!",
        description: "Seu QR Code foi gerado. Mostre na entrada do evento.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg text-white">
        <div className="max-w-md mx-auto">
          <Header />
          <div className="p-4 flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roxo-magenta mx-auto mb-4"></div>
              <p className="text-gray-400">Carregando evento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-dark-bg text-white">
        <div className="max-w-md mx-auto">
          <Header />
          <div className="p-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Evento não encontrado</h1>
            <p className="text-gray-400">Este evento não existe ou foi removido.</p>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.startDatetime);
  const isToday = eventDate.toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-20">
      <div className="max-w-md mx-auto">
        <Header />
        
        <main className="space-y-6">
          {/* Event Hero */}
          <div className="bg-dark-card rounded-b-2xl overflow-hidden">
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
              <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
              
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-roxo-magenta" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span className="text-gray-300">{event.city}</span>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-5 h-5 text-roxo-magenta" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                  <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span className="text-gray-300">
                  {eventDate.toLocaleDateString('pt-BR')} às {eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {event.description && (
                <p className="text-gray-300 mb-4">{event.description}</p>
              )}

              {event.stats && (
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-center">
                    <div className="text-laranja-vibrante text-lg font-bold">
                      {event.stats.reactionCounts.EU_VOU_COMPARECER || 0}
                    </div>
                    <div className="text-gray-400 text-xs">vão comparecer</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-500 text-lg font-bold">
                      {event.stats.totalCheckedIn}
                    </div>
                    <div className="text-gray-400 text-xs">check-ins</div>
                  </div>
                </div>
              )}

              <ReactionButtons
                eventId={event.id}
                userReaction={userReaction?.reaction}
                onReaction={(reaction) => reactionMutation.mutate(reaction)}
                isLoading={reactionMutation.isPending}
              />

              {userReaction?.reaction === 'EU_VOU_COMPARECER' && (
                <div className="mt-4">
                  <Button
                    onClick={() => checkInMutation.mutate()}
                    disabled={checkInMutation.isPending}
                    className="w-full bg-laranja-vibrante hover:bg-orange-600 text-white py-3 rounded-xl font-semibold"
                  >
                    {checkInMutation.isPending ? 'Gerando...' : 'Gerar QR Code'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Incentives */}
          {event.incentives && event.incentives.length > 0 && (
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Benefícios disponíveis</h2>
              <div className="space-y-3">
                {event.incentives.map((incentive) => (
                  <IncentiveCard key={incentive.id} incentive={incentive} />
                ))}
              </div>
            </div>
          )}
        </main>

        <BottomNav />

        {/* QR Code Modal */}
        <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
          <DialogContent className="bg-dark-card border-0 text-white">
            <DialogHeader>
              <DialogTitle className="text-center">QR Code para Check-in</DialogTitle>
            </DialogHeader>
            <QRGenerator eventId={event.id} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
