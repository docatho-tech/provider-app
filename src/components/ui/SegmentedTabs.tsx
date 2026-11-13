import { Colors } from '@/constants/Colors'
import React from 'react'
import { Pressable, View } from 'react-native'
import ThemedText from '../common/ThemedText'

export interface SegmentedTab {
  label: string
  value: string
  /** Shown beside the label in green. Omitted entirely when undefined — a
   *  bucket whose size is still loading should show no number, not a zero. */
  count?: number
}

/**
 * The New / In Progress / Completed strip on the pharmacy dashboard: a grey
 * track with a white pill sliding under the active label.
 */
const SegmentedTabs = ({ tabs, value, onChange }: {
  tabs: SegmentedTab[]
  value: string
  onChange: (value: string) => void
}) => (
  <View
    className='flex-row items-center rounded-full p-[4px]'
    style={{ backgroundColor: Colors.tabTrack, borderWidth: 1, borderColor: Colors.tabTrackBorder }}
  >
    {tabs.map((tab) => {
      const active = tab.value === value
      return (
        <Pressable
          key={tab.value}
          onPress={() => onChange(tab.value)}
          className='flex-1 flex-row items-center justify-center gap-x-[6px] rounded-full py-[10px]'
          style={active ? { backgroundColor: '#FFFFFF' } : undefined}
        >
          <ThemedText
            size='small'
            className={active ? 'font-semibold text-primary' : ''}
            style={active ? undefined : { color: Colors.secondaryTextColor }}
            numberOfLines={1}
          >
            {tab.label}
          </ThemedText>
          {tab.count === undefined ? null : (
            <ThemedText size='small' className='font-semibold' style={{ color: Colors.successAction }}>
              {tab.count}
            </ThemedText>
          )}
        </Pressable>
      )
    })}
  </View>
)

export default SegmentedTabs
