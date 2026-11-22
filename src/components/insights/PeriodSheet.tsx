import ThemedText from '@/components/common/ThemedText'
import BottomSheet from '@/components/general/BottomSheet'
import { ActionButton } from '@/components/ui/Primitives'
import { Colors } from '@/constants/Colors'
import useCustomSafeAreaInsets from '@/hooks/useCustomSafeAreaInsets'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import Feather from '@expo/vector-icons/Feather'
import CommunityDateTimePicker from '@react-native-community/datetimepicker'
import React, { useEffect, useRef, useState } from 'react'
import { Platform, Pressable, View } from 'react-native'

export type PeriodValue = {
  /** A preset the server names, or 'custom' with the two dates below. */
  period: 'week' | 'month' | 'quarter' | 'custom'
  start?: string
  end?: string
}

export const PRESETS: { label: string; value: PeriodValue['period'] }[] = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: 'quarter' },
]

/** `YYYY-MM-DD` in the partner's own timezone — `toISOString` would shift it. */
export const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const readable = (date: Date) =>
  date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const periodLabel = (value: PeriodValue) => {
  if (value.period !== 'custom') {
    return PRESETS.find((preset) => preset.value === value.period)?.label ?? 'This Week'
  }
  const from = value.start ? readable(new Date(`${value.start}T00:00:00`)) : ''
  const to = value.end ? readable(new Date(`${value.end}T00:00:00`)) : ''
  return `${from} – ${to}`
}

/** The query params the chosen window is worth on the wire. */
export const periodParams = (value: PeriodValue) =>
  value.period === 'custom'
    ? { start: value.start, end: value.end }
    : { period: value.period }

/**
 * The window the Insights screen is looking at: three presets, or a pair of
 * dates the partner picks.
 *
 * The header used to cycle Week↔Month on tap, which is a picker that hides two
 * thirds of its options and cannot express "the fortnight I was away". The
 * calendar icon the design draws is now a calendar.
 */
const PeriodSheet = ({ show, value, onClose, onApply }: {
  show: boolean
  value: PeriodValue
  onClose: () => void
  onApply: (value: PeriodValue) => void
}) => {
  const sheetRef = useRef<BottomSheetModal>(null)
  const { bottom } = useCustomSafeAreaInsets()

  const today = new Date()
  const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
  const [draft, setDraft] = useState<PeriodValue['period']>(value.period)
  const [start, setStart] = useState(value.start ? new Date(`${value.start}T00:00:00`) : monthAgo)
  const [end, setEnd] = useState(value.end ? new Date(`${value.end}T00:00:00`) : today)
  // Android has no inline date field: the platform dialog is opened by mounting
  // the picker, so which of the two fields asked for it has to be remembered.
  const [picking, setPicking] = useState<'start' | 'end' | null>(null)

  useEffect(() => {
    if (show) sheetRef.current?.present()
    else sheetRef.current?.close()
  }, [show])

  const apply = () => {
    onApply(
      draft === 'custom'
        // Backwards is a slip, not a request for nothing.
        ? { period: 'custom', start: isoDate(start <= end ? start : end), end: isoDate(start <= end ? end : start) }
        : { period: draft },
    )
    sheetRef.current?.close()
  }

  const DateField = ({ which, date }: { which: 'start' | 'end'; date: Date }) => (
    <View className='flex-1'>
      <ThemedText size='small' style={{ color: Colors.secondaryTextColor }}>
        {which === 'start' ? 'From' : 'To'}
      </ThemedText>
      {Platform.OS === 'ios' ? (
        <CommunityDateTimePicker
          value={date}
          mode='date'
          display='compact'
          maximumDate={today}
          onChange={(_event, picked) => {
            if (!picked) return
            setDraft('custom')
            ;(which === 'start' ? setStart : setEnd)(picked)
          }}
        />
      ) : (
        <Pressable
          onPress={() => setPicking(which)}
          className='rounded-[8px] h-[44px] px-[12px] mt-[6px] justify-center'
          style={{ borderWidth: 1, borderColor: Colors.cardBorder }}
        >
          <ThemedText size='standard'>{readable(date)}</ThemedText>
        </Pressable>
      )}
    </View>
  )

  return (
    <BottomSheet ref={sheetRef} onDismiss={onClose}>
      <View className='px-[20px] pt-[6px]' style={{ paddingBottom: bottom + 24 }}>
        <ThemedText size='subheading' className='font-bold mb-[12px]'>Select period</ThemedText>

        {PRESETS.map((preset) => (
          <Pressable
            key={preset.value}
            onPress={() => setDraft(preset.value)}
            className='flex-row items-center justify-between py-[14px]'
            style={{ borderBottomWidth: 1, borderBottomColor: Colors.cardBorder }}
          >
            <ThemedText size='standard'>{preset.label}</ThemedText>
            {draft === preset.value ? <Feather name='check' size={18} color={Colors.primary} /> : null}
          </Pressable>
        ))}

        <Pressable
          onPress={() => setDraft('custom')}
          className='flex-row items-center justify-between py-[14px]'
        >
          <ThemedText size='standard'>Custom range</ThemedText>
          {draft === 'custom' ? <Feather name='check' size={18} color={Colors.primary} /> : null}
        </Pressable>

        <View className='flex-row items-start gap-x-[12px] mb-[8px]'>
          <DateField which='start' date={start} />
          <DateField which='end' date={end} />
        </View>
        <ThemedText size='small' className='mb-[16px]' style={{ color: Colors.mutedTextColor }}>
          Up to 92 days.
        </ThemedText>

        {picking ? (
          <CommunityDateTimePicker
            value={picking === 'start' ? start : end}
            mode='date'
            maximumDate={today}
            onChange={(_event, picked) => {
              const which = picking
              setPicking(null)
              if (!picked || !which) return
              setDraft('custom')
              ;(which === 'start' ? setStart : setEnd)(picked)
            }}
          />
        ) : null}

        <ActionButton title='Apply' onPress={apply} />
      </View>
    </BottomSheet>
  )
}

export default PeriodSheet
