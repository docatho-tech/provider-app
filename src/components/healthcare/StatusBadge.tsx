import ThemedText from '@/components/common/ThemedText'
import { getStatusMeta } from '@/utils/appointmentUi'
import React from 'react'
import { View } from 'react-native'

const StatusBadge = ({ status }: { status: string }) => {
  const meta = getStatusMeta(status)
  return (
    <View className='self-start px-[10px] py-[4px] rounded-full' style={{ backgroundColor: meta.bg }}>
      <ThemedText size='small' style={{ color: meta.text }} className='font-semibold'>{meta.label}</ThemedText>
    </View>
  )
}

export default StatusBadge
