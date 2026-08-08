import PrimaryButton from '@/components/common/PrimaryButton'
import ThemedText from '@/components/common/ThemedText'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import { getFormattedPrice } from '@/utils/base'
import { RelativePathString, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Pressable, ScrollView, TextInput, View } from 'react-native'
import Toast from 'react-native-toast-message'

const DetailRow = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null
  return (
    <View className='mt-[12px]'>
      <ThemedText size='small' className='text-secondaryTextColor'>{label}</ThemedText>
      <ThemedText className='font-medium mt-[4px]'>{value}</ThemedText>
    </View>
  )
}

const canJoinVideoConsultation = (
  consultationMode?: string,
  paymentStatus?: string,
  status?: string,
) => (
  consultationMode === 'online'
  && paymentStatus === 'paid'
  && ['confirmed', 'in_progress'].includes(status ?? '')
)

const AppointmentDetail = () => {
  const router = useRouter()
  const params = useLocalSearchParams<{
    appointmentId: string
    patient_name?: string
    scheduled_at?: string
    status?: string
    consultation_mode?: string
    symptoms?: string
    notes?: string
    prescription_notes?: string
    fee?: string
    payment_status?: string
  }>()

  const [notes, setNotes] = useState(params.prescription_notes ?? '')
  const [status, setStatus] = useState(params.status ?? '')
  const { requestPATCH } = useAxios(API_ENDPOINTS.APPOINTMENTS)

  const updateStatus = async (newStatus: string, prescription_notes?: string) => {
    const body: Record<string, unknown> = {
      appointment_id: Number(params.appointmentId),
      status: newStatus,
    }
    if (prescription_notes !== undefined) body.prescription_notes = prescription_notes
    const res = await requestPATCH(body)
    if (res.status === 200) {
      setStatus(newStatus)
      Toast.show({ type: 'success', text1: 'Appointment updated' })
    }
  }

  const scheduledLabel = params.scheduled_at
    ? new Date(params.scheduled_at).toLocaleString()
    : undefined

  const joinVideo = () => {
    router.push({
      pathname: '/appointments/[appointmentId]/video' as RelativePathString,
      params: {
        appointmentId: params.appointmentId,
        patientName: params.patient_name || 'Patient',
        scheduledAt: params.scheduled_at || '',
      },
    })
  }

  return (
    <ScrollView className='flex-1 bg-white px-[5%] pt-[20px]'>
      <ThemedText size='largeHeading' className='font-bold'>
        {params.patient_name || 'Patient'}
      </ThemedText>
      <ThemedText size='small' className='text-secondaryTextColor capitalize mt-[4px]'>
        {params.consultation_mode?.replace('_', ' ')} · {status}
      </ThemedText>

      <View className='mt-[20px] bg-[#F7F9FC] rounded-[12px] p-[16px]'>
        <DetailRow label='Scheduled' value={scheduledLabel} />
        <DetailRow label='Symptoms' value={params.symptoms} />
        <DetailRow label='Patient notes' value={params.notes} />
        <DetailRow label='Prescription notes' value={params.prescription_notes} />
        {params.fee ? (
          <DetailRow label='Fee' value={getFormattedPrice(Number(params.fee))} />
        ) : null}
        <DetailRow label='Payment' value={params.payment_status} />
      </View>

      {canJoinVideoConsultation(params.consultation_mode, params.payment_status, status) ? (
        <PrimaryButton title='Join video consultation' className='mt-[24px]' onPress={joinVideo} />
      ) : null}

      {status === 'pending' && (
        <View className='flex-row gap-[10px] mt-[24px]'>
          <PrimaryButton title='Accept' className='flex-1' onPress={() => updateStatus('confirmed')} />
          <Pressable
            className='flex-1 border border-red-300 rounded-default items-center justify-center'
            onPress={() => updateStatus('rejected')}
          >
            <ThemedText className='text-red-500 font-semibold'>Reject</ThemedText>
          </Pressable>
        </View>
      )}

      {['confirmed', 'in_progress'].includes(status) && (
        <View className='mt-[24px] gap-[12px]'>
          <ThemedText className='font-semibold'>Prescription notes</ThemedText>
          <TextInput
            className='border border-primary/20 rounded-[8px] p-[12px] min-h-[100px] text-[#313131]'
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder='Add prescription or follow-up notes'
            placeholderTextColor={Colors.secondaryTextColor}
          />
          <PrimaryButton title='Mark Complete' onPress={() => updateStatus('completed', notes)} />
        </View>
      )}

      <View className='h-[40px]' />
    </ScrollView>
  )
}

export default AppointmentDetail
