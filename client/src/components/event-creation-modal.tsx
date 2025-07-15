import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Clock, Tag, MapPin, Gift } from "lucide-react";

interface EventCreationModalProps {
  onCreateEvent: (eventData: any) => void;
  isCreating: boolean;
}

export default function EventCreationModal({ onCreateEvent, isCreating }: EventCreationModalProps) {
  const [open, setOpen] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    category: "",
    startDatetime: "",
    endDatetime: "",
    benefits: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateEvent(eventData);
    setOpen(false);
    setEventData({
      title: "",
      description: "",
      category: "",
      startDatetime: "",
      endDatetime: "",
      benefits: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-roxo-magenta hover:bg-roxo-magenta/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-roxo-magenta" />
            Criar Novo Evento
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white flex items-center">
              <Tag className="h-4 w-4 mr-2 text-roxo-magenta" />
              Título do Evento
            </Label>
            <Input
              id="title"
              value={eventData.title}
              onChange={(e) => setEventData({...eventData, title: e.target.value})}
              placeholder="Ex: Noite do Pagode"
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-roxo-magenta focus:ring-roxo-magenta"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Descrição</Label>
            <Textarea
              id="description"
              value={eventData.description}
              onChange={(e) => setEventData({...eventData, description: e.target.value})}
              placeholder="Descrição do evento..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-roxo-magenta focus:ring-roxo-magenta"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="text-white flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-roxo-magenta" />
              Categoria
            </Label>
            <Select value={eventData.category} onValueChange={(value) => setEventData({...eventData, category: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-roxo-magenta focus:ring-roxo-magenta">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="PAGODE">Pagode</SelectItem>
                <SelectItem value="SERTANEJO">Sertanejo</SelectItem>
                <SelectItem value="FUNK">Funk</SelectItem>
                <SelectItem value="FORRÓ">Forró</SelectItem>
                <SelectItem value="TECHNO">Techno</SelectItem>
                <SelectItem value="ROCK">Rock</SelectItem>
                <SelectItem value="SAMBA">Samba</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDatetime" className="text-white flex items-center">
                <Clock className="h-4 w-4 mr-2 text-roxo-magenta" />
                Data e Hora de Início
              </Label>
              <Input
                id="startDatetime"
                type="datetime-local"
                value={eventData.startDatetime}
                onChange={(e) => setEventData({...eventData, startDatetime: e.target.value})}
                className="bg-gray-800 border-gray-600 text-white focus:border-roxo-magenta focus:ring-roxo-magenta [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDatetime" className="text-white">Data e Hora de Fim (opcional)</Label>
              <Input
                id="endDatetime"
                type="datetime-local"
                value={eventData.endDatetime}
                onChange={(e) => setEventData({...eventData, endDatetime: e.target.value})}
                className="bg-gray-800 border-gray-600 text-white focus:border-roxo-magenta focus:ring-roxo-magenta [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="benefits" className="text-white flex items-center">
              <Gift className="h-4 w-4 mr-2 text-roxo-magenta" />
              Benefícios/Incentivos
            </Label>
            <Textarea
              id="benefits"
              value={eventData.benefits}
              onChange={(e) => setEventData({...eventData, benefits: e.target.value})}
              placeholder="Ex: Desconto de 20% em bebidas, entrada gratuita até 23h..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-roxo-magenta focus:ring-roxo-magenta"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating}
              className="bg-roxo-magenta hover:bg-roxo-magenta/90 text-white"
            >
              {isCreating ? "Criando..." : "Criar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}