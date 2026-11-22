import { Colors } from '@/constants/Colors'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import React from 'react'
import { ActivityIndicator, Image, Pressable, TextInput, View } from 'react-native'
import ThemedText from '../common/ThemedText'

/** The pale-blue rounded square a list row's leading icon sits in. */
export const IconPill = ({ children, size = 34 }: { children: React.ReactNode; size?: number }) => (
  <View
    className='bg-iconPill items-center justify-center'
    style={{ width: size, height: size, borderRadius: 10 }}
  >
    {children}
  </View>
)

/** The circular variant, used where the row leads with a person rather than a thing. */
export const CircleIcon = ({ children, size = 36 }: { children: React.ReactNode; size?: number }) => (
  <View
    className='bg-iconPill items-center justify-center'
    style={{ width: size, height: size, borderRadius: size / 2 }}
  >
    {children}
  </View>
)

export type ChipTone = 'success' | 'dark' | 'soft' | 'outline' | 'primarySoft'

const CHIP_TONES: Record<ChipTone, { bg: string; text: string; border?: string }> = {
  success: { bg: Colors.successBg, text: Colors.successText },
  dark: { bg: 'rgba(49, 49, 49, 0.80)', text: '#FFFFFF' },
  soft: { bg: '#EFEFEF', text: Colors.primaryTextColor },
  outline: { bg: '#FFFFFF', text: Colors.primaryTextColor, border: '#D9D9D9' },
  primarySoft: { bg: Colors.iconPill, text: Colors.primary },
}

export const Chip = ({ label, tone = 'soft', icon, className = '' }: {
  label: string
  tone?: ChipTone
  icon?: React.ReactNode
  className?: string
}) => {
  const spec = CHIP_TONES[tone]
  return (
    <View
      className={`flex-row items-center gap-x-[6px] px-[12px] py-[6px] rounded-full ${className}`}
      style={{
        backgroundColor: spec.bg,
        borderWidth: spec.border ? 1 : 0,
        borderColor: spec.border,
      }}
    >
      {icon}
      <ThemedText size='small' className='font-semibold' style={{ color: spec.text }}>{label}</ThemedText>
    </View>
  )
}

/**
 * The amber countdown strip above a request that will be accepted for the
 * partner if they do nothing. It states the deadline, so it is a banner and not
 * a toast — a toast that disappears cannot be the only notice of an automatic
 * decision.
 */
export const CountdownBanner = ({ text }: { text: string }) => (
  <View
    className='flex-row items-center gap-x-[10px] px-[14px] py-[12px] rounded-[10px]'
    style={{ backgroundColor: Colors.warnBg, borderWidth: 1, borderColor: Colors.warnBorder }}
  >
    <Feather name='clock' size={16} color={Colors.warnText} />
    <ThemedText size='small' className='font-semibold flex-1' style={{ color: Colors.warnText }}>{text}</ThemedText>
  </View>
)

export type ActionTone = 'primary' | 'outlinePrimary' | 'danger' | 'neutral' | 'success' | 'disabled'

const ACTION_TONES: Record<ActionTone, { bg: string; text: string; border: string }> = {
  primary: { bg: Colors.primary, text: '#FFFFFF', border: Colors.primary },
  /** The paired "Update Bank Details" — the same weight as its neighbour, not louder. */
  outlinePrimary: { bg: '#FFFFFF', text: Colors.primary, border: Colors.primary },
  danger: { bg: '#FFFFFF', text: Colors.danger, border: Colors.danger },
  neutral: { bg: '#FFFFFF', text: Colors.primaryTextColor, border: '#D9D9D9' },
  success: { bg: Colors.successAction, text: '#FFFFFF', border: Colors.successAction },
  // An accepted consultation that has not started yet: still shown, still
  // clearly the primary thing on the screen, but not pressable.
  disabled: { bg: '#FFFFFF', text: '#8FA5DA', border: '#C3D1EB' },
}

export const ActionButton = ({ title, tone = 'primary', onPress, icon, loading = false, size = 'lg', className = '' }: {
  title: string
  tone?: ActionTone
  onPress?: () => void
  icon?: React.ReactNode
  loading?: boolean
  /** `sm` is the in-row button the notification rows use; `lg` is the footer's. */
  size?: 'sm' | 'lg'
  className?: string
}) => {
  const spec = ACTION_TONES[tone]
  const disabled = tone === 'disabled' || loading
  const small = size === 'sm'
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center gap-x-[8px] ${small ? 'rounded-[8px] h-[38px] px-[18px]' : 'rounded-[10px] h-[52px]'} ${className}`}
      style={{ backgroundColor: spec.bg, borderWidth: 1, borderColor: spec.border }}
    >
      {loading ? <ActivityIndicator size='small' color={spec.text} /> : icon}
      <ThemedText size={small ? 'standard' : 'subheading'} className='font-semibold' style={{ color: spec.text }}>{title}</ThemedText>
    </Pressable>
  )
}

/**
 * The All / Unread / In clinic Visits / Online Consults strip on the
 * notifications screen — a filled primary pill for the one in force, an
 * outlined one for the rest.
 */
export const FilterChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    className='px-[14px] h-[34px] rounded-[8px] items-center justify-center'
    style={{
      backgroundColor: active ? Colors.primary : '#FFFFFF',
      borderWidth: 1,
      borderColor: active ? Colors.primary : Colors.cardBorder,
    }}
  >
    <ThemedText size='small' className='font-semibold' style={{ color: active ? '#FFFFFF' : Colors.primaryTextColor }}>
      {label}
    </ThemedText>
  </Pressable>
)

/** Five stars, `value` of them filled — the rating notifications' only content. */
export const Stars = ({ value, size = 17 }: { value: number; size?: number }) => (
  <View className='flex-row items-center gap-x-[4px]'>
    {[1, 2, 3, 4, 5].map((position) => (
      <FontAwesome
        key={position}
        name='star'
        size={size}
        color={position <= value ? Colors.star : '#DCDCDC'}
      />
    ))}
  </View>
)

/**
 * The white bar the action buttons live in, pinned below the scroll area.
 * Two buttons split the width evenly; one fills it.
 */
export const StickyFooter = ({ children, bottomInset = 0 }: { children: React.ReactNode; bottomInset?: number }) => (
  <View
    className='flex-row items-center gap-x-[12px] bg-white px-[16px] pt-[12px]'
    style={{ paddingBottom: bottomInset + 12, borderTopWidth: 1, borderTopColor: Colors.cardBorder }}
  >
    {children}
  </View>
)

export const SearchField = ({ placeholder = 'Search for appointments', value, onChangeText }: {
  placeholder?: string
  value?: string
  onChangeText?: (text: string) => void
}) => (
  <View
    className='flex-row items-center gap-x-[10px] bg-white px-[14px] rounded-[10px] h-[48px]'
    style={{ borderWidth: 1, borderColor: Colors.cardBorder }}
  >
    <Feather name='search' size={18} color={Colors.mutedTextColor} />
    <TextInput
      className='flex-1 text-[15px]'
      style={{ color: Colors.primaryTextColor }}
      placeholder={placeholder}
      placeholderTextColor={Colors.mutedTextColor}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
)

/** A patient photo, falling back to their initial when none is on file. */
export const Avatar = ({ uri, name = '', size = 44, radius }: { uri?: string | null; name?: string; size?: number; radius?: number }) => {
  const borderRadius = radius ?? size / 2
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius }} />
  }
  return (
    <View className='bg-iconPill items-center justify-center' style={{ width: size, height: size, borderRadius }}>
      <ThemedText className='font-bold text-primary' style={{ fontSize: size * 0.4 }}>
        {(name.trim()[0] ?? '?').toUpperCase()}
      </ThemedText>
    </View>
  )
}
