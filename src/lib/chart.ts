import { useEffect, useRef, useState } from 'react'

/**
 * Categorical chart palette, in fixed slot order. Validated for colour-blind
 * separation on a white surface; keep the order when adding series.
 */
export const CHART = {
  blue: '#2a78d6',
  orange: '#eb6834',
  aqua: '#1baf7a',
  yellow: '#eda100',
  grid: '#eaeef4',
  axis: '#cbd5e1',
  muted: '#64748b',
} as const

export const CHART_SERIES = [CHART.blue, CHART.orange, CHART.aqua, CHART.yellow]

/** Tracks an element's width so SVG charts can render at real pixel size. */
export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}

/** Round axis ticks covering [min, max]. */
export function niceTicks(min: number, max: number, count = 4) {
  if (min === max) max = min + 1
  const rawStep = (max - min) / count
  const mag = 10 ** Math.floor(Math.log10(rawStep))
  const norm = rawStep / mag
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag
  const start = Math.floor(min / step) * step
  const end = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toFixed(6)))
  return ticks
}
