import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-roxo-magenta rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <div>
              <span className="text-roxo-magenta font-bold text-3xl">COMPARECE</span>
              <span className="text-laranja-vibrante font-bold text-3xl">.AI</span>
            </div>
          </div>
          <p className="text-gray-300 text-lg">
            Sua presença, seus benefícios
          </p>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center p-6 space-y-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Conecte-se com a <span className="text-roxo-magenta">noite</span> da sua cidade
            </h1>
            <p className="text-gray-300 text-lg">
              Descubra eventos, ganhe recompensas e viva a melhor experiência da vida noturna
            </p>
          </div>

          <div className="space-y-4">
            <Card className="bg-dark-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-roxo-magenta to-laranja-vibrante rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Check-in inteligente</h3>
                    <p className="text-gray-400 text-sm">QR Code único para cada evento</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-laranja-vibrante to-roxo-magenta rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Recompensas exclusivas</h3>
                    <p className="text-gray-400 text-sm">Drinks, descontos e brindes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Comunidade vibrante</h3>
                    <p className="text-gray-400 text-sm">Conecte-se com outros frequentadores</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 space-y-4">
          <Button
            onClick={() => window.location.href = '/api/login'}
            className="w-full bg-roxo-magenta hover:bg-roxo-escuro text-white py-4 text-lg font-semibold rounded-2xl"
          >
            Começar agora
          </Button>
          <p className="text-center text-gray-400 text-sm">
            A balada começa aqui
          </p>
        </div>
      </div>
    </div>
  );
}
