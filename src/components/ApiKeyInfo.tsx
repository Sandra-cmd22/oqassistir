import { AlertCircle } from 'lucide-react';

export function ApiKeyInfo() {
  return (
    <div className="bg-gradient-to-b from-[#000000] from-25% to-[#5f5476] min-h-screen flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-[10px] p-6 max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-white" />
          <h2 className="font-['Montserrat:SemiBold',sans-serif] font-semibold text-white text-[18px]">
            Configure sua API Key
          </h2>
        </div>
        
        <div className="space-y-4 text-white font-['Montserrat:Light',sans-serif] font-light text-[14px]">
          <p>
            Para usar este aplicativo, você precisa de uma chave da API do TMDB (The Movie Database).
          </p>
          
          <div className="bg-black/30 rounded-[5px] p-4 space-y-2">
            <p className="font-['Montserrat:SemiBold',sans-serif] font-semibold text-[16px]">
              Como obter:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Acesse <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="underline">themoviedb.org</a></li>
              <li>Crie uma conta gratuita</li>
              <li>Vá em Configurações → API</li>
              <li>Solicite uma chave de API</li>
              <li>Copie a chave (API Key v3)</li>
              <li>Cole no arquivo /App.tsx na linha 7</li>
            </ol>
          </div>
          
          <p className="text-[12px] text-white/70">
            A API do TMDB é gratuita e fornece informações completas sobre filmes, incluindo sinopse, elenco e imagens.
          </p>
        </div>
      </div>
    </div>
  );
}
