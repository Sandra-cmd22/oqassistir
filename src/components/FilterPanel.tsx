import { X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FilterPanelProps {
  selectedMonth: number | null;
  selectedGenres: number[];
  genres: { [key: number]: string };
  onMonthChange: (month: number | null) => void;
  onGenreToggle: (genreId: number) => void;
  onClose: () => void;
  onApply: (month: number | null, genres: number[]) => void;
  onClear: () => void;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function FilterPanel({ 
  selectedMonth, 
  selectedGenres, 
  genres, 
  onMonthChange, 
  onGenreToggle,
  onClose,
  onApply,
  onClear
}: FilterPanelProps) {
  // Temporary states for filters (before applying)
  const [tempMonth, setTempMonth] = useState<number | null>(selectedMonth);
  const [tempGenres, setTempGenres] = useState<number[]>(selectedGenres);

  // Update temp states when props change
  useEffect(() => {
    setTempMonth(selectedMonth);
    setTempGenres(selectedGenres);
  }, [selectedMonth, selectedGenres]);

  const handleApply = () => {
    onApply(tempMonth, tempGenres);
    onClose();
  };

  const handleClear = () => {
    setTempMonth(null);
    setTempGenres([]);
    onClear();
  };

  const handleGenreToggle = (genreId: number) => {
    setTempGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const hasChanges = tempMonth !== selectedMonth || 
                     JSON.stringify(tempGenres.sort()) !== JSON.stringify(selectedGenres.sort());
  
  const hasActiveFilters = tempMonth !== null || tempGenres.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0e] h-full overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 px-4 py-4 flex items-center justify-between z-10">
          <h2 className="font-['Montserrat:Bold',sans-serif] text-white text-[20px]">
            Filtros
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-6 space-y-8 pb-32">
          {/* Month Filter */}
          <div>
            <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-4">
              Mês de Lançamento
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTempMonth(null)}
                className={`py-3 px-4 rounded-[8px] font-['Montserrat:Medium',sans-serif] text-[14px] transition-all ${
                  tempMonth === null
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Todos
              </button>
              {MONTHS.map((month, index) => (
                <button
                  key={index}
                  onClick={() => setTempMonth(index)}
                  className={`py-3 px-4 rounded-[8px] font-['Montserrat:Medium',sans-serif] text-[14px] transition-all ${
                    tempMonth === index
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {month.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Genre Filter */}
          <div>
            <h3 className="font-['Montserrat:SemiBold',sans-serif] text-white text-[16px] mb-4">
              Gêneros
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(genres).map(([id, name]) => {
                const genreId = parseInt(id);
                const isSelected = tempGenres.includes(genreId);
                
                return (
                  <button
                    key={id}
                    onClick={() => handleGenreToggle(genreId)}
                    className={`py-2 px-4 rounded-full font-['Montserrat:Medium',sans-serif] text-[14px] transition-all ${
                      isSelected
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="sticky bottom-0 bg-gradient-to-t from-[#0d0d0e] via-[#0d0d0e] to-transparent px-4 py-4 border-t border-white/10 space-y-3">
          <button
            onClick={handleApply}
            className={`w-full py-4 rounded-[10px] font-['Montserrat:Bold',sans-serif] text-[16px] transition-all flex items-center justify-center gap-2 ${
              hasChanges
                ? 'bg-white text-black hover:bg-white/90 shadow-lg'
                : 'bg-white/20 text-white cursor-not-allowed'
            }`}
            disabled={!hasChanges}
          >
            <Check className="w-5 h-5" />
            Aplicar Filtros
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="w-full py-3 rounded-[10px] bg-white/10 text-white font-['Montserrat:SemiBold',sans-serif] text-[14px] hover:bg-white/20 transition-all"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
}