import type { CSSProperties } from 'react';

type PlaceholderTone = 'espresso' | 'crimson' | 'olive' | 'deep';
type PlaceholderVariant = 'hero' | 'default' | 'compact';

interface ZibaraPlaceholderProps {
  label: string;
  sublabel?: string;
  tone?: PlaceholderTone;
  variant?: PlaceholderVariant;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

const toneMap: Record<PlaceholderTone, { background: string; glow: string; edge: string }> = {
  espresso: {
    background:
      'linear-gradient(145deg, rgba(47,27,26,0.98), rgba(10,8,6,0.98) 58%, rgba(3,3,3,1))',
    glow:
      'radial-gradient(circle at 50% 38%, rgba(201,169,110,0.12), transparent 30%), radial-gradient(circle at 18% 18%, rgba(201,169,110,0.12), transparent 40%), radial-gradient(circle at 82% 82%, rgba(78,0,0,0.22), transparent 46%)',
    edge: 'rgba(239,239,201,0.08)',
  },
  crimson: {
    background:
      'linear-gradient(145deg, rgba(78,0,0,0.96), rgba(47,27,26,0.94) 56%, rgba(3,3,3,1))',
    glow:
      'radial-gradient(circle at 50% 34%, rgba(201,169,110,0.14), transparent 30%), radial-gradient(circle at 20% 22%, rgba(201,169,110,0.12), transparent 36%), radial-gradient(circle at 78% 26%, rgba(100,0,23,0.24), transparent 42%)',
    edge: 'rgba(201,169,110,0.12)',
  },
  olive: {
    background:
      'linear-gradient(145deg, rgba(90,94,39,0.82), rgba(47,27,26,0.92) 52%, rgba(3,3,3,1))',
    glow:
      'radial-gradient(circle at 50% 36%, rgba(201,169,110,0.12), transparent 30%), radial-gradient(circle at 25% 18%, rgba(201,169,110,0.12), transparent 38%), radial-gradient(circle at 78% 78%, rgba(90,94,39,0.18), transparent 44%)',
    edge: 'rgba(239,239,201,0.08)',
  },
  deep: {
    background:
      'linear-gradient(145deg, rgba(10,8,6,0.98), rgba(3,3,3,1) 62%, rgba(47,27,26,0.9))',
    glow:
      'radial-gradient(circle at 50% 35%, rgba(201,169,110,0.1), transparent 28%), radial-gradient(circle at 16% 16%, rgba(201,169,110,0.12), transparent 34%), radial-gradient(circle at 84% 84%, rgba(78,0,0,0.2), transparent 42%)',
    edge: 'rgba(239,239,201,0.07)',
  },
};

const variantMap: Record<PlaceholderVariant, { wrap: string; sub: string; label: string; panel: string }> = {
  hero: {
    wrap: 'p-6 md:p-10',
    sub: 'text-[9px] md:text-[11px] tracking-[0.45em]',
    label: 'text-[clamp(2rem,6vw,5rem)] leading-[0.92]',
    panel: 'max-w-[16ch]',
  },
  default: {
    wrap: 'p-4 md:p-5',
    sub: 'text-[8px] md:text-[10px] tracking-[0.38em]',
    label: 'text-base md:text-2xl leading-tight',
    panel: 'max-w-[15ch]',
  },
  compact: {
    wrap: 'p-3 md:p-4',
    sub: 'text-[7px] md:text-[9px] tracking-[0.32em]',
    label: 'text-sm md:text-lg leading-tight',
    panel: 'max-w-[13ch]',
  },
};

export default function ZibaraPlaceholder({
  label,
  sublabel = 'ZIBARASTUDIO',
  tone = 'espresso',
  variant = 'default',
  className = '',
  align = 'center',
}: ZibaraPlaceholderProps) {
  const toneStyles = toneMap[tone];
  const variantStyles = variantMap[variant];
  const alignmentClass = align === 'start'
    ? 'items-start'
    : align === 'end'
      ? 'items-end'
      : 'items-center';

  return (
    <div
      role="img"
      aria-label={label}
      className={`relative isolate overflow-hidden ${className}`}
      style={
        {
          background: toneStyles.background,
          '--placeholder-edge': toneStyles.edge,
        } as CSSProperties
      }
    >
      <div
        className="zibara-placeholder-glow absolute -inset-[12%] opacity-95 will-change-transform"
        style={{ background: toneStyles.glow }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(3,3,3,0.18),rgba(3,3,3,0.78))]" />
      <div className="zibara-placeholder-ring-primary absolute inset-[10%] rounded-[40%] border border-[var(--placeholder-edge)] opacity-60 will-change-transform" />
      <div className="zibara-placeholder-ring-secondary absolute inset-[18%] rounded-[46%] border border-[var(--placeholder-edge)] opacity-25 will-change-transform" />
      <div className="zibara-placeholder-shimmer absolute -inset-x-[8%] inset-y-0 opacity-30 mix-blend-screen bg-[linear-gradient(120deg,transparent_0%,rgba(239,239,201,0.06)_22%,transparent_42%,transparent_100%)] will-change-transform" />
      <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_52%,rgba(3,3,3,0.4)_100%)]" />

      <div className={`zibara-placeholder-panel absolute inset-0 flex ${alignmentClass} justify-center ${variantStyles.wrap} will-change-transform`}>
        <div className={`${variantStyles.panel} mx-auto text-center`}>
          <p className={`${variantStyles.sub} font-mono uppercase text-zibara-cream/58 mb-2`}>
            {sublabel}
          </p>
          <p
            className={`${variantStyles.label} font-light uppercase text-zibara-cream/92 text-balance`}
            style={{ fontFamily: 'var(--font-cormorant), serif', textWrap: 'balance' }}
          >
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}
