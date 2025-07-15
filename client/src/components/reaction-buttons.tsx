import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ThumbsUp, X } from "lucide-react";

export type ReactionType = "EU_VOU_COMPARECER" | "PENSANDO_EM_IR" | "NAO_VOU_PODER_IR";

interface ReactionButtonsProps {
  onReaction: (reaction: ReactionType) => void;
  userReaction?: ReactionType;
  isLoading?: boolean;
  reactionCounts?: Record<string, number>;
}

const reactionConfig = {
  EU_VOU_COMPARECER: {
    emoji: "🔥",
    label: "Vou comparecer",
    color: "bg-green-600 hover:bg-green-700",
    textColor: "text-white",
    variant: "success" as const
  },
  PENSANDO_EM_IR: {
    emoji: "🤔",
    label: "Pensando em ir",
    color: "bg-yellow-600 hover:bg-yellow-700",
    textColor: "text-white",
    variant: "warning" as const
  },
  NAO_VOU_PODER_IR: {
    emoji: "😞",
    label: "Não vou poder ir",
    color: "bg-red-600 hover:bg-red-700",
    textColor: "text-white",
    variant: "destructive" as const
  }
};

export default function ReactionButtons({ 
  onReaction, 
  userReaction, 
  isLoading, 
  reactionCounts = {} 
}: ReactionButtonsProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Como você está para esse evento?</h3>
        <p className="text-sm text-gray-400">Escolha sua reação</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
        {Object.entries(reactionConfig).map(([key, config]) => {
          const reactionKey = key as ReactionType;
          const isSelected = userReaction === reactionKey;
          const count = reactionCounts[reactionKey] || 0;
          
          return (
            <div key={key} className="relative">
              <Button
                onClick={() => onReaction(reactionKey)}
                disabled={isLoading}
                className={`
                  w-full h-auto p-4 flex flex-row items-center justify-center space-x-3 
                  transition-all duration-200 transform hover:scale-105 rounded-xl
                  ${isSelected 
                    ? `${config.color} ring-2 ring-white ring-offset-2 ring-offset-dark-bg shadow-lg` 
                    : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'
                  }
                `}
              >
                <span className="text-2xl">{config.emoji}</span>
                <span className={`text-base font-medium flex-1 text-left ${isSelected ? config.textColor : 'text-white'}`}>
                  {config.label}
                </span>
                {count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 bg-roxo-magenta text-white text-xs min-w-[20px] h-5 flex items-center justify-center"
                  >
                    {count}
                  </Badge>
                )}
              </Button>
            </div>
          );
        })}
      </div>
      
      {userReaction && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-dark-card px-4 py-2 rounded-full">
            <span className="text-lg">{reactionConfig[userReaction].emoji}</span>
            <span className="text-sm text-gray-300">
              Você: {reactionConfig[userReaction].label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}