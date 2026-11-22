import { Colors } from '@/constants/Colors'
import React from 'react'
import { View } from 'react-native'
import ThemedText from '../common/ThemedText'

/**
 * The one card shape every partner-app screen is built from: a white rounded
 * box with a tinted, titled strip across the top and hairline-separated rows
 * underneath.
 *
 * `CardSection` is the strip; `CardRow` is a row that draws its own separator
 * unless it is the first. Screens compose those rather than re-deriving the
 * padding, because the design's rows differ in content and never in geometry.
 */

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <View
    className={`bg-white rounded-card overflow-hidden ${className}`}
    style={{ borderWidth: 1, borderColor: Colors.cardBorder }}
  >
    {children}
  </View>
)

export const CardSection = ({ icon, title, right }: { icon?: React.ReactNode; title: string; right?: React.ReactNode }) => (
  <View className='bg-cardHeader flex-row items-center justify-between px-[16px] py-[14px]'>
    <View className='flex-row items-center gap-x-[10px] flex-1'>
      {icon}
      <ThemedText size='subheading' className='font-semibold' numberOfLines={1}>{title}</ThemedText>
    </View>
    {right}
  </View>
)

/**
 * The separator is inset by the row's own horizontal padding rather than run
 * card-edge to card-edge — that is what the design draws, and the difference
 * is visible on every card in the app.
 */
export const CardRow = ({ children, first = false, className = '' }: { children: React.ReactNode; first?: boolean; className?: string }) => (
  <View>
    {first ? null : <Hairline className='mx-[16px]' />}
    <View className={`px-[16px] py-[14px] ${className}`}>{children}</View>
  </View>
)

/** A full-width hairline, for splitting content inside a single row. */
export const Hairline = ({ className = '' }: { className?: string }) => (
  <View className={className} style={{ height: 1, backgroundColor: Colors.separator }} />
)
