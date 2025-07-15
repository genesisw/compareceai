import { Card, CardContent } from "@/components/ui/card";
import { Incentive } from "@/types";

interface IncentiveCardProps {
  incentive: Incentive;
}

export default function IncentiveCard({ incentive }: IncentiveCardProps) {
  const getIncentiveIcon = (type: string) => {
    const icons = {
      'VALE_CHOPP': (
        <svg className="w-5 h-5 text-laranja-vibrante" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 3V1H3v2H1v2h2v6c0 2.21 1.79 4 4 4v6h2v-6c2.21 0 4-1.79 4-4V5h2V3H5zm8 8c0 1.1-.9 2-2 2s-2-.9-2-2V5h4v6z"/>
        </svg>
      ),
      'CUPOM_DESCONTO': (
        <svg className="w-5 h-5 text-laranja-vibrante" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.79 21L3 11.21v2c0 .53.21 1.04.59 1.41l7.79 7.79c.78.78 2.05.78 2.83 0l6.21-6.21c.78-.78.78-2.05 0-2.83L12.79 21z"/>
          <path d="M11.38 17.41c.39.39.9.59 1.41.59s1.02-.2 1.41-.59l6.21-6.21c.78-.78.78-2.05 0-2.83L12.62 0.21C12.24-.17 11.73-.38 11.21-.38S10.18-.17 9.79.21L3.59 6.41c-.78.78-.78 2.05 0 2.83L11.38 17.41z"/>
        </svg>
      ),
      'BRINDE': (
        <svg className="w-5 h-5 text-laranja-vibrante" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      'OUTRO': (
        <svg className="w-5 h-5 text-laranja-vibrante" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      ),
    };
    return icons[type as keyof typeof icons] || icons.OUTRO;
  };

  const getIncentiveLabel = (type: string) => {
    const labels = {
      'VALE_CHOPP': 'Vale Chopp',
      'CUPOM_DESCONTO': 'Cupom Desconto',
      'BRINDE': 'Brinde',
      'OUTRO': 'Benefício',
    };
    return labels[type as keyof typeof labels] || 'Benefício';
  };

  const isAvailable = incentive.availableQuantity ? incentive.availableQuantity > 0 : true;

  return (
    <Card className={`bg-dark-surface border-0 ${!isAvailable ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getIncentiveIcon(incentive.type)}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">{incentive.title}</h4>
            <p className="text-sm text-gray-400 mb-2">{getIncentiveLabel(incentive.type)}</p>
            {incentive.description && (
              <p className="text-sm text-gray-300 mb-3">{incentive.description}</p>
            )}
            
            {incentive.totalQuantity && (
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  {incentive.availableQuantity} / {incentive.totalQuantity} disponíveis
                </div>
                <div className="w-20 bg-gray-600 rounded-full h-1.5">
                  <div 
                    className="bg-laranja-vibrante h-1.5 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${incentive.totalQuantity > 0 ? ((incentive.availableQuantity || 0) / incentive.totalQuantity) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0">
            {isAvailable ? (
              <div className="text-green-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            ) : (
              <div className="text-red-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
