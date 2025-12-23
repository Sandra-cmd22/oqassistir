import { useState, useEffect } from 'react';

interface ColorPalette {
  backgroundColor: string;
}

export function usePosterColors(imageUrl: string | null): ColorPalette {
  const [colors, setColors] = useState<ColorPalette>({
    backgroundColor: 'rgba(95, 84, 118, 0.3)'
  });

  useEffect(() => {
    if (!imageUrl) {
      setColors({ backgroundColor: 'rgba(95, 84, 118, 0.3)' });
      return;
    }

    const img = new Image();
    // Try without crossOrigin first
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Use smaller canvas for better performance
        canvas.width = 50;
        canvas.height = 75;
        
        try {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;

          let r = 0, g = 0, b = 0, count = 0;

          // Sample pixels from edges for color bleed effect
          for (let i = 0; i < pixels.length; i += 4) {
            const pr = pixels[i];
            const pg = pixels[i + 1];
            const pb = pixels[i + 2];
            const pa = pixels[i + 3];

            // Skip transparent and very dark pixels
            if (pa < 128) continue;
            const brightness = (pr + pg + pb) / 3;
            if (brightness < 20) continue;

            r += pr;
            g += pg;
            b += pb;
            count++;
          }

          if (count > 0) {
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            setColors({
              backgroundColor: `rgba(${r}, ${g}, ${b}, 0.3)`
            });
          }
        } catch (canvasError) {
          // CORS error - use default gradient
          console.log('Canvas access blocked (CORS), using default colors');
        }
      } catch (error) {
        // Silent fail - use default colors
      }
    };

    img.onerror = () => {
      // Silent fail - use default colors
    };
  }, [imageUrl]);

  return colors;
}