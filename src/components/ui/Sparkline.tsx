import React from 'react'
import { View } from 'react-native'
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import ThemedText from '../common/ThemedText'
import { Colors } from '@/constants/Colors'

/**
 * The seven-day line every Insights card draws: a solid curve for this period,
 * a dotted one for the same window before it, and a fade under the solid line.
 *
 * Hand-rolled on `react-native-svg` rather than pulled from a chart library —
 * this is one series, one comparison and no axes, and a charting dependency
 * would arrive with a legend, a tooltip layer and a theme to fight.
 */

const HEIGHT = 96
const PADDING = 6

/**
 * A Catmull-Rom spline as cubic béziers.
 *
 * The design's lines curve through their points; a polyline through the same
 * seven values reads as a different chart. Catmull-Rom because it passes
 * *through* every point — a smoothing that misses the points would be drawing
 * numbers nobody reported.
 */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  const at = (index: number) => points[Math.max(0, Math.min(points.length - 1, index))]
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    path += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`
  }
  return path
}

export const Sparkline = ({ series, previous, labels, color, width }: {
  series: number[]
  previous?: number[]
  labels: string[]
  color: string
  width: number
}) => {
  const plot = width - PADDING * 2
  // Both lines share one scale, or the comparison compares nothing. A flat
  // series gets a span of 1 so it draws down the middle instead of dividing
  // by zero.
  const all = [...series, ...(previous ?? [])]
  const low = Math.min(...all, 0)
  const high = Math.max(...all, 1)
  const span = high - low || 1

  const toPoints = (values: number[]) => values.map((value, index) => ({
    x: PADDING + (values.length === 1 ? plot / 2 : (index / (values.length - 1)) * plot),
    y: PADDING + (1 - (value - low) / span) * (HEIGHT - PADDING * 2),
  }))

  const points = toPoints(series)
  const line = smoothPath(points)
  const gradientId = `fade-${color.replace('#', '')}`

  return (
    <View>
      <Svg width={width} height={HEIGHT}>
        <Defs>
          <LinearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
            <Stop offset='0' stopColor={color} stopOpacity={0.18} />
            <Stop offset='1' stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {points.length > 1 ? (
          <Path
            d={`${line} L ${points[points.length - 1].x} ${HEIGHT} L ${points[0].x} ${HEIGHT} Z`}
            fill={`url(#${gradientId})`}
          />
        ) : null}

        {previous?.length ? (
          <Path
            d={smoothPath(toPoints(previous))}
            stroke={color}
            strokeOpacity={0.55}
            strokeWidth={1.5}
            strokeDasharray='4 4'
            fill='none'
          />
        ) : null}

        <Path d={line} stroke={color} strokeWidth={2.5} fill='none' strokeLinecap='round' />
      </Svg>

      <View className='flex-row justify-between mt-[10px]' style={{ paddingHorizontal: PADDING }}>
        {labels.map((label, index) => (
          <ThemedText key={`${label}-${index}`} size='small' style={{ color: Colors.secondaryTextColor }}>
            {label}
          </ThemedText>
        ))}
      </View>
    </View>
  )
}

export default Sparkline
