'use client';

import { useState } from 'react';

export const CARD_PLACEHOLDER = '/placeholder-card.svg';

interface Props {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

/** Card picture with the TCG aspect ratio; falls back to the placeholder if missing or broken. */
export default function CardImage({ src, alt, className = '' }: Props) {
  const [failed, setFailed] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- TCGdex images, no Next optimization quota spent
    <img
      src={!src || failed ? CARD_PLACEHOLDER : src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`w-full aspect-[245/342] object-contain rounded-lg bg-slate-800 ${className}`}
    />
  );
}
