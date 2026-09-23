import { TYPES, typeColor } from '@/constants/types';

export default function TypeBadge({ type }: { type: string }) {
  const color = typeColor(type);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
      style={{ backgroundColor: `${color}33`, boxShadow: `inset 0 0 0 1px ${color}66` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {TYPES[type]?.label ?? type}
    </span>
  );
}
