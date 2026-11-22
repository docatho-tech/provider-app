import { Colors } from '@/constants/Colors'
import Feather from '@expo/vector-icons/Feather'
import React from 'react'
import { Pressable, View } from 'react-native'
import ThemedText from '../common/ThemedText'
import { Card, CardRow, CardSection } from './Card'
import { IconPill } from './Primitives'

/**
 * The two-figure card at the top of every dashboard and index screen —
 * "12 Today's | 10 Upcoming". The right-hand figure is the one that needs
 * attention, so it carries the alert colour when `alertRight` is set.
 */
export const OverviewCard = ({ title, left, right, alertRight = false }: {
  title: string
  left: { value: number | string; label: string; icon?: React.ReactNode }
  right: { value: number | string; label: string; icon?: React.ReactNode }
  alertRight?: boolean
}) => (
  <Card>
    <CardSection icon={<Feather name='calendar' size={16} color={Colors.primaryTextColor} />} title={title} />
    <View className='flex-row items-center py-[18px]'>
      <OverviewHalf {...left} />
      <View style={{ width: 1, height: 44, backgroundColor: Colors.separator }} />
      <OverviewHalf {...right} valueColor={alertRight ? Colors.alert : undefined} />
    </View>
  </Card>
)

const OverviewHalf = ({ value, label, icon, valueColor }: {
  value: number | string
  label: string
  icon?: React.ReactNode
  valueColor?: string
}) => (
  <View className='flex-1 items-center'>
    <ThemedText size='largeHeading' className='font-bold' style={valueColor ? { color: valueColor } : undefined}>
      {value}
    </ThemedText>
    <View className='flex-row items-center gap-x-[6px] mt-[6px]'>
      {icon}
      <ThemedText size='small' style={{ color: valueColor ?? Colors.secondaryTextColor }}>{label}</ThemedText>
    </View>
  </View>
)

/**
 * One person in a day-grouped list: a pill icon saying how they are being seen,
 * their name with age and sex beside it, what kind of visit it is underneath,
 * and the day over the time on the right.
 */
export const PersonRow = ({ icon, name, meta, subtitle, day, time, first = false, onPress }: {
  icon: React.ReactNode
  name: string
  meta?: string
  subtitle?: React.ReactNode
  day: string
  time: string
  first?: boolean
  onPress?: () => void
}) => (
  <Pressable onPress={onPress}>
    <CardRow first={first}>
      <View className='flex-row items-center gap-x-[12px]'>
        <IconPill>{icon}</IconPill>
        <View className='flex-1'>
          <View className='flex-row items-center gap-x-[6px] flex-wrap'>
            <ThemedText size='subheading' className='font-semibold'>{name}</ThemedText>
            {meta ? (
              <ThemedText size='small' style={{ color: Colors.mutedTextColor }}>• {meta}</ThemedText>
            ) : null}
          </View>
          {subtitle ? <View className='mt-[4px]'>{subtitle}</View> : null}
        </View>
        <View className='items-end'>
          <ThemedText size='small' className='font-semibold'>{day}</ThemedText>
          <ThemedText size='small' className='mt-[4px]' style={{ color: Colors.mutedTextColor }}>{time}</ThemedText>
        </View>
      </View>
    </CardRow>
  </Pressable>
)

/** The centred blue link that closes a dashboard card. */
export const CardLinkRow = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable onPress={onPress}>
    <CardRow>
      <ThemedText size='subheading' className='text-primary font-semibold text-center'>{label}</ThemedText>
    </CardRow>
  </Pressable>
)

/** "No appointments today" and friends — one line, centred, muted. */
export const EmptyRow = ({ text }: { text: string }) => (
  <CardRow first>
    <ThemedText size='small' className='text-center' style={{ color: Colors.mutedTextColor }}>{text}</ThemedText>
  </CardRow>
)
