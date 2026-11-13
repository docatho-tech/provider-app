import React from 'react'
import Svg, { Path } from 'react-native-svg'

/**
 * The Docatho mark, as a tintable vector.
 *
 * The tab bar shows it for the Dashboard tab and has to draw it in the active
 * and inactive colours; the app-icon PNG is a white mark on a blue square, so
 * tinting it produces a solid block rather than a logo.
 */
const BrandMark = ({ color = '#204BB6', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
    {/* The bowl of the D. */}
    <Path
      d='M9.4 3.6h1.9a8.4 8.4 0 0 1 0 16.8H9.4'
      stroke={color}
      strokeWidth={3}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    {/* The chevron tucked into its stem. */}
    <Path
      d='M3.4 7.8 7.4 12l-4 4.2'
      stroke={color}
      strokeWidth={3}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Svg>
)

export default BrandMark
