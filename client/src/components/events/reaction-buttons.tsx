import { Button } from "@/components/ui/button";

interface ReactionButtonsProps {
  eventId: string;
  userReaction?: 'EU_VOU_COMPARECER' | 'PENSANDO_EM_IR' | 'NAO_VOU_PODER_IR';
  onReaction: (reaction: string) => void;
  isLoading?: boolean;
}

export default function ReactionButtons({ 
  eventId, 
  userReaction, 
  onReaction, 
  isLoading = false 
}: ReactionButtonsProps) {
  const reactions = [
    {
      key: 'EU_VOU_COMPARECER',
      label: 'EU VOU',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      )
    },
    {
      key: 'PENSANDO_EM_IR',
      label: 'PENSANDO',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.5 9.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm5 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm1.5 6.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      )
    },
    {
      key: 'NAO_VOU_PODER_IR',
      label: 'NÃO VOU',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="flex space-x-2">
      {reactions.map((reaction) => {
        const isSelected = userReaction === reaction.key;
        const isConfirmed = userReaction === 'EU_VOU_COMPARECER' && reaction.key === 'EU_VOU_COMPARECER';
        
        return (
          <Button
            key={reaction.key}
            onClick={() => onReaction(reaction.key)}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all ${
              isConfirmed
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : isSelected
                ? 'bg-roxo-magenta hover:bg-roxo-escuro text-white'
                : 'bg-dark-surface hover:bg-gray-600 text-gray-300'
            }`}
          >
            {reaction.icon}
            <span className="text-sm">
              {isConfirmed ? 'CONFIRMADO' : reaction.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
