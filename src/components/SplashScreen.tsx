import { useEffect, useState } from 'react';
import logoImage from '../assets/logo.oficial.png';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Após 1 segundo, inicia a animação de saída
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Aguarda a animação terminar antes de chamar onFinish
      setTimeout(() => {
        onFinish();
      }, 300); // Tempo da animação de fade out
    }, 1000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-gradient-to-br from-[#0a0a0f] via-[#1a0f2e] to-[#2d1b3d] flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`flex flex-col items-center justify-center transition-all duration-500 ${
          isVisible
            ? 'scale-100 opacity-100'
            : 'scale-95 opacity-0'
        }`}
      >
        <img
          src={logoImage}
          alt="OQ Assistir"
          className="w-[120px] h-[72px] object-contain animate-pulse"
        />
      </div>
    </div>
  );
}

