import PrimaryButton from '@/components/common/PrimaryButton'
import ThemedText from '@/components/common/ThemedText'
import VideoConsultationRoom from '@/components/video/VideoConsultationRoom'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import { tokens } from '@/constants/designTokens'
import useAxios from '@/hooks/useAxios'
import { formatSlotLabel } from '@/utils/appointmentUi'
import { iVideoTokenResponse } from '@/interfaces/provider'
import { replaceUrlParams } from '@/utils/base'
import { Ionicons } from '@expo/vector-icons'
import { RelativePathString, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import Toast from 'react-native-toast-message'

const CHECKLIST = [
  { icon: 'wifi' as const, text: 'Stable internet connection' },
  { icon: 'videocam' as const, text: 'Camera and microphone enabled' },
  { icon: 'medkit' as const, text: 'Patient chart ready for notes' },
]

const ProviderVideoConsultationLobby = () => {
  const router = useRouter()
  const { appointmentId, patientName, scheduledAt } = useLocalSearchParams<{
    appointmentId: string; patientName?: string; scheduledAt?: string
  }>()
  const [tokenData, setTokenData] = useState<iVideoTokenResponse | null>(null)
  const [joining, setJoining] = useState(false)
  const videoTokenUrl = replaceUrlParams(API_ENDPOINTS.APPOINTMENT_VIDEO_TOKEN, { appointmentId })
  const { requestPOST } = useAxios<iVideoTokenResponse>(videoTokenUrl, true)

  const joinCall = async () => {
    setJoining(true)
    const res = await requestPOST({})
    setJoining(false)
    if (res.status === 200) setTokenData(res.data)
    else Toast.show({ type: 'error', text1: 'Could not join consultation' })
  }

  if (tokenData) {
    return (
      <VideoConsultationRoom
        authToken={tokenData.auth_token}
        userName={tokenData.user_name}
        mock={tokenData.mock}
        onLeave={() => router.replace({
          pathname: '/appointments/[appointmentId]' as RelativePathString,
          params: { appointmentId, patient_name: patientName || 'Patient', scheduled_at: scheduledAt || '', status: 'in_progress' },
        })}
      />
    )
  }

  const scheduledLabel = scheduledAt ? formatSlotLabel(scheduledAt) : undefined

  return (
    <View className='flex-1 px-[5%] pt-[24px]' style={{ backgroundColor: tokens.surface.page }}>
      <View className='bg-white rounded-[16px] p-[20px] border border-primary/10'>
        <ThemedText size='largeHeading' className='font-bold'>Before you join</ThemedText>
        {patientName ? <ThemedText className='mt-[8px] font-semibold text-[17px]'>{patientName}</ThemedText> : null}
        {scheduledLabel ? <ThemedText size='small' className='text-secondaryTextColor mt-[4px]'>{scheduledLabel}</ThemedText> : null}
        <ThemedText className='text-secondaryTextColor mt-[16px]'>Encrypted consultation. Add prescription notes after the call.</ThemedText>
        <View className='mt-[16px] gap-[10px]'>
          {CHECKLIST.map((item) => (
            <View key={item.text} className='flex-row items-center gap-[10px]'>
              <Ionicons name={item.icon} size={18} color={Colors.primary} />
              <ThemedText size='small'>{item.text}</ThemedText>
            </View>
          ))}
        </View>
      </View>
      <View className='mt-[24px]'>
        {joining ? <ActivityIndicator color={Colors.primary} size='large' /> : (
          <PrimaryButton title='Join video consultation' onPress={joinCall} />
        )}
      </View>
    </View>
  )
}

export default ProviderVideoConsultationLobby
