import React from 'react'
import { View } from 'react-native'
import ThemedText from './ThemedText'

const Chips = ({ text, color, backgroundColor }: { text: string, color: string, backgroundColor: string }) => {
  return (
    <View style={{ backgroundColor: backgroundColor }} className='px-[5px] py-[5px] rounded-[20px] min-w-[80px]'>
      <ThemedText style={{ color: color }} className='!text-[12px] text-center font-semibold capitalize'>{text}</ThemedText>
    </View>
  )
}

export default Chips