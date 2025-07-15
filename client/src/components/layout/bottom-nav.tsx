import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const navItems = [
    {
      path: "/",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
      label: "Início"
    },
    {
      path: "/events",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      ),
      label: "Buscar"
    },
    {
      path: "/profile",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      ),
      label: "Perfil"
    }
  ];

  // Add dashboard and employee options for authorized users
  if (user && ['SUPER_ADMIN', 'DONO_ESTABELECIMENTO'].includes(user.role)) {
    navItems.splice(2, 0, {
      path: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      ),
      label: "Dashboard"
    });
  }

  if (user && ['SUPER_ADMIN', 'DONO_ESTABELECIMENTO', 'FUNCIONARIO'].includes(user.role)) {
    navItems.splice(-1, 0, {
      path: "/employee",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6.5 9.5v3h-3v-3h3M19 13h-6v6h6v-6zM6.5 7.5H8v1H6.5V7.5zm0 9H8v1H6.5v-1zM13.5 7.5H15v1h-1.5V7.5zm0 9H15v1h-1.5v-1z"/>
        </svg>
      ),
      label: "Validar"
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-surface">
      <div className="max-w-md mx-auto flex justify-around py-3">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => setLocation(item.path)}
            className={`flex flex-col items-center space-y-1 ${
              location === item.path ? 'text-roxo-magenta' : 'text-gray-400'
            }`}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
