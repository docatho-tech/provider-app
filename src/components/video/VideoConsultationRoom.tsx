import ThemedText from '@/components/common/ThemedText'
import { Colors } from '@/constants/Colors'
import { HMSPrebuilt } from '@100mslive/react-native-room-kit'
import { useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

type Props = {
  authToken: string
  userName: string
  onLeave?: () => void
  mock?: boolean
}

const VideoConsultationRoom = ({ authToken, userName, onLeave, mock }: Props) => {
  const router = useRouter()

  const handleLeave = () => {
    onLeave?.()
    router.back()
  }

  if (mock) {
    return (
      <View className='flex-1 bg-[#0B1F3F] items-center justify-center px-[8%]'>
        <ThemedText className='text-white text-center text-[18px] font-bold'>Dev mode</ThemedText>
        <ThemedText className='text-white/70 text-center mt-[12px]'>
          Configure HMS credentials on the backend to enable live video calls.
        </ThemedText>
        <Pressable className='mt-[24px] bg-primary px-[24px] py-[12px] rounded-[10px]' onPress={handleLeave}>
          <ThemedText className='text-white font-semibold'>Go back</ThemedText>
        </Pressable>
      </View>
    )
  }

  if (!authToken) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator color={Colors.primary} size='large' />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HMSPrebuilt token={authToken} options={{ userName }} onLeave={handleLeave} handleBackButton />
    </GestureHandlerRootView>
  )
}

export default VideoConsultationRoom
