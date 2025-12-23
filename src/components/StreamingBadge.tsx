import { ImageWithFallback } from './figma/ImageWithFallback';

interface StreamingBadgeProps {
  providers: {
    logo_path: string;
    provider_name: string;
  }[];
}

export function StreamingBadge({ providers }: StreamingBadgeProps) {
  if (!providers || providers.length === 0) return null;

  const imageBaseUrl = 'https://image.tmdb.org/t/p/original';

  return (
    <div className="absolute top-2 right-2 flex gap-1 z-10">
      {providers.map((provider, index) => (
        <div
          key={index}
          className="w-8 h-8 rounded-md overflow-hidden bg-white shadow-lg ring-2 ring-white/20"
          title={provider.provider_name}
        >
          <ImageWithFallback
            src={`${imageBaseUrl}${provider.logo_path}`}
            alt={provider.provider_name}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
