interface MonthFilterProps {
  selectedMonth: number;
  onMonthChange: (month: number) => void;
}

export function MonthFilter({ selectedMonth, onMonthChange }: MonthFilterProps) {
  const months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' }
  ];

  return (
    <div className="flex gap-[12px] overflow-x-auto pb-2 px-[18px] scrollbar-hide">
      {months.map((month) => (
        <button
          key={month.value}
          onClick={() => onMonthChange(month.value)}
          className={`relative h-[36px] px-[18px] rounded-[25px] shrink-0 flex items-center justify-center transition-all ${
            selectedMonth === month.value
              ? 'bg-[rgba(217,217,217,0.3)]'
              : 'bg-[rgba(217,217,217,0.2)]'
          }`}
        >
          <div 
            aria-hidden="true" 
            className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]"
          />
          <p className="font-['Montserrat:Light',sans-serif] font-light text-white text-[16px] leading-[normal] whitespace-nowrap">
            {month.label}
          </p>
        </button>
      ))}
    </div>
  );
}
