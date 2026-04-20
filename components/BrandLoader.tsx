import ZibaraPlaceholder from './ZibaraPlaceholder';

interface BrandLoaderProps {
  label?: string;
  sublabel?: string;
  tone?: 'espresso' | 'crimson' | 'olive' | 'deep';
  variant?: 'hero' | 'default' | 'compact';
  fullScreen?: boolean;
  className?: string;
}

export default function BrandLoader({
  label = 'Loading',
  sublabel = 'ZIBARASTUDIO',
  tone = 'deep',
  variant = 'compact',
  fullScreen = true,
  className = 'w-40 md:w-56',
}: BrandLoaderProps) {
  const content = (
    <div className={`${className} aspect-[4/5] animate-pulse`}>
      <ZibaraPlaceholder
        label={label}
        sublabel={sublabel}
        tone={tone}
        variant={variant}
        className="w-full h-full rounded-sm border border-zibara-cream/10"
      />
    </div>
  );

  if (!fullScreen) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zibara-black">
      {content}
    </div>
  );
}
