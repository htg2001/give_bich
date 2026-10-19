import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import type { GiftImage } from '../gift.config';
import { resolveMediaPath } from '../utils/media';

interface PhotoGalleryProps {
  id?: string;
  images: GiftImage[];
}

const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ id, images }) => {
  const [failedSources, setFailedSources] = useState<string[]>([]);

  const photos = images
    .map((image) => (typeof image === 'string' ? { src: image, caption: undefined } : image))
    .filter((photo) => photo.src.trim() !== '' && !failedSources.includes(photo.src));

  if (photos.length === 0) return null;

  return (
    <section
      id={id}
      aria-label="Thư viện ảnh"
      data-testid="photo-gallery"
      className="card-emerging relative z-30 w-full max-w-4xl mx-auto px-4 pt-6 pb-10"
    >
      <div className="flex items-center justify-center gap-2 mb-6 text-rose-800">
        <Camera className="w-5 h-5 text-rose-500" />
        <h2
          className="text-2xl md:text-3xl font-bold"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          Những khoảnh khắc đáng nhớ
        </h2>
      </div>

      <div className="columns-2 md:columns-3 gap-4">
        {photos.map((photo, index) => (
          <figure
            key={photo.src}
            className={`break-inside-avoid mb-4 p-2 pb-3 bg-white rounded-md shadow-[0_10px_30px_rgba(142,48,88,0.15)] border border-rose-100 transition-transform duration-300 hover:rotate-0 hover:scale-[1.03] ${
              TILTS[index % TILTS.length]
            }`}
          >
            <img
              src={resolveMediaPath(photo.src)}
              alt={photo.caption ?? `Ảnh ${index + 1}`}
              loading="lazy"
              className="w-full h-auto rounded-sm block"
              onError={() => {
                console.warn(`Không tải được ảnh: ${resolveMediaPath(photo.src)}`);
                setFailedSources((previous) => [...previous, photo.src]);
              }}
            />
            {photo.caption && (
              <figcaption
                className="mt-2 text-center text-lg text-rose-700"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                {photo.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
};
