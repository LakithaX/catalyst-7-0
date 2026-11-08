import React from 'react';

export const CATALYST_MARK_PATHS = {
  webp128: '/assets/brand/catalyst-mark-128.webp',
  webp256: '/assets/brand/catalyst-mark-256.webp',
  webp512: '/assets/brand/catalyst-mark-512.webp',
  fallbackPng: '/assets/brand/catalyst-mark-512.png',
} as const;

export interface CatalystMarkProps extends React.HTMLAttributes<HTMLElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | number;
  decorative?: boolean;
  priority?: boolean;
  className?: string;
  alt?: string;
}

const SIZE_MAP: Record<'xs' | 'sm' | 'md' | 'lg', { height: number; width: number }> = {
  xs: { height: 20, width: 17 },
  sm: { height: 32, width: 26 },
  md: { height: 48, width: 40 },
  lg: { height: 96, width: 79 },
};

export const CatalystMark: React.FC<CatalystMarkProps> = ({
  size = 'md',
  decorative = true,
  priority = false,
  className = '',
  alt,
  style,
  ...rest
}) => {
  const altText = decorative ? '' : (alt || 'Catalyst 7.0 mark');

  let width: number | undefined;
  let height: number | undefined;

  if (typeof size === 'number') {
    height = size;
    width = Math.round(size * (845 / 1023));
  } else if (SIZE_MAP[size]) {
    width = SIZE_MAP[size].width;
    height = SIZE_MAP[size].height;
  }

  return (
    <picture
      className={`inline-block shrink-0 select-none ${className}`}
      style={style}
      {...rest}
    >
      <source
        type="image/webp"
        srcSet={`${CATALYST_MARK_PATHS.webp128} 128w, ${CATALYST_MARK_PATHS.webp256} 256w, ${CATALYST_MARK_PATHS.webp512} 512w`}
        sizes={height ? `${Math.round(height * 0.83)}px` : '(max-width: 640px) 36px, 48px'}
      />
      <img
        src={CATALYST_MARK_PATHS.fallbackPng}
        alt={altText}
        aria-hidden={decorative ? true : undefined}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={false}
        className="w-full h-full object-contain pointer-events-none"
      />
    </picture>
  );
};

export default CatalystMark;
