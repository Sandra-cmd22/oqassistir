import { Home, Newspaper, Heart, Shuffle } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'news' | 'favorites' | 'newsDetail' | 'random';
  onNavigate: (view: 'home' | 'news' | 'favorites' | 'newsDetail' | 'random') => void;
  hasActiveFilters: boolean;
  favoritesCount: number;
}

export function Navbar({ currentView, onNavigate, hasActiveFilters, favoritesCount }: NavbarProps) {
  const navItems = [
    { id: 'home' as const, icon: Home, label: 'Explore' },
    { id: 'random' as const, icon: Shuffle, label: 'Aleatório' },
    { id: 'favorites' as const, icon: Heart, label: 'Favoritos' },
    { id: 'news' as const, icon: Newspaper, label: 'Notícias' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around safe-area-inset-bottom" style={{ paddingBottom: 'calc(4px + env(safe-area-inset-bottom))', pointerEvents: 'auto', position: 'fixed', zIndex: 999999 }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all flex-1 ${
              isActive 
                ? 'text-white' 
                : 'text-white/40 hover:text-white/60 hover:bg-white/10'
            }`}
          >
            <div className="relative">
              <Icon 
                className={isActive ? 'w-7 h-7 text-white fill-white' : 'w-6 h-6 text-white/60'} 
                strokeWidth={isActive ? 1.5 : 0.5}
                fill={isActive ? 'currentColor' : 'none'}
                style={isActive ? { color: 'white' } : { color: 'rgba(255, 255, 255, 0.6)' }}
              />
              {item.id === 'favorites' && favoritesCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span 
              className={`text-[10px] leading-tight`}
              style={isActive ? { color: 'white', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 } : { color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}