import { Home, Newspaper, Compass, Heart, Shuffle } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'swiper' | 'news' | 'favorites' | 'newsDetail' | 'random';
  onNavigate: (view: 'home' | 'swiper' | 'news' | 'favorites' | 'newsDetail' | 'random') => void;
  hasActiveFilters: boolean;
  favoritesCount: number;
}

export function Navbar({ currentView, onNavigate, hasActiveFilters, favoritesCount }: NavbarProps) {
  const navItems = [
    { id: 'home' as const, icon: Home, label: 'Explore' },
    { id: 'swiper' as const, icon: Compass, label: 'Descobrir' },
    { id: 'random' as const, icon: Shuffle, label: 'Aleatório' },
    { id: 'favorites' as const, icon: Heart, label: 'Favoritos' },
    { id: 'news' as const, icon: Newspaper, label: 'Notícias' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 px-2 py-3 flex items-center justify-around z-50 safe-area-inset-bottom" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
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
                className={isActive ? 'w-7 h-7 stroke-[2.5]' : 'w-6 h-6 stroke-2'} 
                style={isActive ? { color: '#04FFA7' } : undefined}
              />
              {item.id === 'favorites' && favoritesCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span 
              className={`text-[10px] leading-tight`}
              style={isActive ? { color: '#04FFA7', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 } : { fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}