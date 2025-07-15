import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, logoutMutation } = useAuth();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email?.split('@')[0] || 'Usuário';
  };

  return (
    <header className="bg-dark-card p-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-roxo-magenta rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
        <div>
          <span className="text-roxo-magenta font-bold text-xl">COMPARECE</span>
          <span className="text-laranja-vibrante font-bold text-xl">.AI</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => logoutMutation.mutate()}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? 'Saindo...' : 'Logout'}
        </Button>
        <Avatar className="w-8 h-8">
          <AvatarImage src={user?.profileImageUrl || ''} />
          <AvatarFallback className="bg-gray-600 text-white text-sm">
            {getUserDisplayName() ? getInitials(getUserDisplayName()) : 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
