import { cn } from '@/lib/utils'

interface BarcodeProps {
  value: string
  className?: string
  /** Bar height in px. */
  height?: number
}

/**
 * Barcode-style visual for a sample reference. The bars are generated from the
 * characters so each value looks distinct, but this is NOT a scannable symbology.
 */
export function Barcode({ value, className, height = 56 }: BarcodeProps) {
  // 1 = bar, 0 = gap; start/stop guards around 7 bits per character
  const bits = ['101', ...[...value].map((ch) => ch.charCodeAt(0).toString(2).padStart(7, '0') + '0'), '101'].join('')
  const bars: { x: number; w: number }[] = []
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] !== '1') continue
    const prev = bars[bars.length - 1]
    if (prev && prev.x + prev.w === i) prev.w += 1
    else bars.push({ x: i, w: 1 })
  }

  return (
    <div className={cn('text-center', className)}>
      <svg
        viewBox={`0 0 ${bits.length} ${height}`}
        preserveAspectRatio="none"
        className="w-full text-slate-900"
        style={{ height }}
        role="img"
        aria-label={`Barcode for ${value}`}
      >
        {bars.map((bar) => (
          <rect key={bar.x} x={bar.x} y={0} width={bar.w} height={height} fill="currentColor" />
        ))}
      </svg>
      <p className="mt-1.5 text-[13px] font-bold tracking-[0.22em] text-slate-900">{value}</p>
    </div>
  )
}
