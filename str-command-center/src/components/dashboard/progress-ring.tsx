import { cn } from '@/lib/utils';

interface ProgressRingProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

const sizeMap = {
  sm: { dimension: 80, stroke: 6 },
  md: { dimension: 120, stroke: 8 },
  lg: { dimension: 160, stroke: 10 },
  xl: { dimension: 200, stroke: 12 },
};

export function ProgressRing({
  value,
  size = 'lg',
  strokeWidth,
  className,
  showLabel = true,
  label,
}: ProgressRingProps) {
  const { dimension, stroke } = sizeMap[size];
  const actualStroke = strokeWidth || stroke;
  const radius = (dimension - actualStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 90) return '#10b981'; // emerald-500
    if (val >= 70) return '#3b82f6'; // blue-500
    if (val >= 50) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const color = getColor(value);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={dimension}
        height={dimension}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={actualStroke}
          fill="none"
          className="text-zinc-800"
        />
        {/* Progress circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke={color}
          strokeWidth={actualStroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white" style={{ color }}>
            {value}%
          </span>
          {label && (
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
