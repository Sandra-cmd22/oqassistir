import { Home, Newspaper, Compass, Heart } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'swiper' | 'news' | 'favorites' | 'newsDetail';
  onNavigate: (view: 'home' | 'swiper' | 'news' | 'favorites' | 'newsDetail') => void;
  hasActiveFilters: boolean;
  favoritesCount: number;
}

export function Navbar({ currentView, onNavigate, hasActiveFilters, favoritesCount }: NavbarProps) {
  const navItems = [
    { id: 'home' as const, icon: Home, label: 'Explore' },
    { id: 'swiper' as const, icon: Compass, label: 'Descobrir' },
    { id: 'favorites' as const, icon: Heart, label: 'Favoritos' },
    { id: 'news' as const, icon: Newspaper, label: 'Notícias' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 px-4 py-3 flex items-center justify-around z-50 safe-area-inset-bottom" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
              isActive 
                ? 'text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="relative">
              <Icon 
                className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} 
                style={isActive ? { color: '#04FFA7' } : undefined}
              />
              {item.id === 'favorites' && favoritesCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span 
              className={`text-[11px] font-['Montserrat:${isActive ? 'SemiBold' : 'Regular'}',sans-serif]`}
              style={isActive ? { color: '#04FFA7' } : undefined}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}