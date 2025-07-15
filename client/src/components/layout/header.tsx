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
      <div className="flex items-center">
        <img 
          src="/logo-comparece-ai.png" 
          alt="Comparece.ai" 
          className="h-8 w-auto"
        />
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
