import { Card, CardContent } from "@/components/ui/card";
import { UserStats } from "@/types";

interface UserLevelProps {
  userStats: UserStats;
}

export default function UserLevel({ userStats }: UserLevelProps) {
  const getLevelInfo = (level: string) => {
    const levels = {
      'BRONZE': { name: 'Bronze', color: 'from-yellow-600 to-yellow-800', icon: '🥉', nextLevel: 'SILVER' },
      'SILVER': { name: 'Prata', color: 'from-gray-400 to-gray-600', icon: '🥈', nextLevel: 'GOLD' },
      'GOLD': { name: 'Ouro', color: 'from-yellow-400 to-yellow-600', icon: '🥇', nextLevel: 'PLATINUM' },
      'PLATINUM': { name: 'Platina', color: 'from-blue-400 to-blue-600', icon: '💎', nextLevel: 'DIAMOND' },
      'DIAMOND': { name: 'Diamante', color: 'from-purple-400 to-purple-600', icon: '💠', nextLevel: null },
    };
    return levels[level as keyof typeof levels] || levels.BRONZE;
  };

  const getProgressPercentage = () => {
    const currentLevel = userStats.level;
    const checkIns = userStats.monthlyCheckIns;
    
    // Define thresholds for each level
    const thresholds = {
      'BRONZE': 5,
      'SILVER': 10,
      'GOLD': 20,
      'PLATINUM': 35,
      'DIAMOND': 50,
    };
    
    const currentThreshold = thresholds[currentLevel as keyof typeof thresholds] || 5;
    return Math.min((checkIns / currentThreshold) * 100, 100);
  };

  const getCheckInsToNextLevel = () => {
    const currentLevel = userStats.level;
    const checkIns = userStats.monthlyCheckIns;
    
    const thresholds = {
      'BRONZE': 5,
      'SILVER': 10,
      'GOLD': 20,
      'PLATINUM': 35,
      'DIAMOND': 50,
    };
    
    const currentThreshold = thresholds[currentLevel as keyof typeof thresholds] || 5;
    return Math.max(currentThreshold - checkIns, 0);
  };

  const levelInfo = getLevelInfo(userStats.level);
  const progressPercentage = getProgressPercentage();
  const checkInsToNext = getCheckInsToNextLevel();

  return (
    <Card className="bg-dark-card border-0">
      <CardContent className="p-4">
        <h3 className="text-xl font-bold mb-4 text-white">Seus benefícios</h3>
        
        <div className={`bg-gradient-to-r ${levelInfo.color} p-4 rounded-xl text-white mb-4`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{levelInfo.icon}</span>
              <span className="font-semibold">Frequentador {levelInfo.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Pontos</div>
              <div className="font-bold text-lg">{userStats.points}</div>
            </div>
          </div>
          
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <p className="text-sm opacity-90">
            {checkInsToNext > 0 
              ? `${checkInsToNext} comparecimentos para o próximo nível`
              : 'Nível máximo atingido!'
            }
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-surface rounded-xl p-3 text-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">{userStats.monthlyCheckIns} Check-ins</p>
            <p className="text-xs text-gray-400">Este mês</p>
          </div>
          
          <div className="bg-dark-surface rounded-xl p-3 text-center">
            <div className="w-8 h-8 bg-laranja-vibrante rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">{userStats.availableRewards} Brindes</p>
            <p className="text-xs text-gray-400">Disponíveis</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
