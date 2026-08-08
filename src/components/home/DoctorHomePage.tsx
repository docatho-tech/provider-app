import PrimaryButton from '@/components/common/PrimaryButton'
import ThemedText from '@/components/common/ThemedText'
import StatusBadge from '@/components/healthcare/StatusBadge'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import { formatSlotLabel } from '@/utils/appointmentUi'
import { RelativePathString, useRouter } from 'expo-router'
import React, { useEffect, useMemo } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native'

interface Appointment {
  id: number
  patient_name?: string
  scheduled_at: string
  status: string
  consultation_mode: string
  payment_status?: string
  symptoms?: string
}

const canJoin = (a: Appointment) => (
  a.consultation_mode === 'online'
  && a.payment_status === 'paid'
  && ['confirmed', 'in_progress'].includes(a.status)
)

export default function DoctorHomePage() {
  const router = useRouter()
  const [refreshing, setRefreshing] = React.useState(false)
  const { requestGET, response, isLoading } = useAxios<Appointment[]>(API_ENDPOINTS.APPOINTMENTS)
  const load = () => requestGET()
  useEffect(() => { load() }, [])
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }

  const { pendingToday, confirmedToday, nextAppointment } = useMemo(() => {
    const today = new Date().toDateString()
    const appointments = response ?? []
    const isToday = (date: string) => new Date(date).toDateString() === today
    const upcoming = appointments
      .filter((a) => !['completed', 'cancelled', 'rejected'].includes(a.status))
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    return {
      pendingToday: appointments.filter((a) => a.status === 'pending' && isToday(a.scheduled_at)).length,
      confirmedToday: appointments.filter(
        (a) => ['confirmed', 'in_progress'].includes(a.status) && isToday(a.scheduled_at),
      ).length,
      nextAppointment: upcoming[0] ?? null,
    }
  }, [response])

  if (isLoading) return <ActivityIndicator className='mt-[40px]' color={Colors.primary} />

  return (
    <ScrollView className='flex-1 bg-[#F7F9FC] px-[5%] pt-[20px]' refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
      <ThemedText size='heading' className='font-semibold'>Today&apos;s overview</ThemedText>
      <View className='flex-row gap-[12px] mt-[16px]'>
        <View className='flex-1 bg-white rounded-[12px] p-[16px] border border-primary/10'>
          <ThemedText size='heading' className='font-semibold text-primary'>{pendingToday}</ThemedText>
          <ThemedText size='small' className='text-secondaryTextColor mt-[4px]'>Pending requests</ThemedText>
        </View>
        <View className='flex-1 bg-white rounded-[12px] p-[16px] border border-primary/10'>
          <ThemedText size='heading' className='font-semibold text-primary'>{confirmedToday}</ThemedText>
          <ThemedText size='small' className='text-secondaryTextColor mt-[4px]'>Confirmed today</ThemedText>
        </View>
      </View>

      {nextAppointment ? (
        <View className='bg-white rounded-[12px] p-[16px] mt-[16px] border border-primary/10'>
          <ThemedText size='small' className='text-secondaryTextColor'>Next patient</ThemedText>
          <ThemedText className='font-semibold mt-[4px]'>{nextAppointment.patient_name || 'Patient'}</ThemedText>
          <ThemedText size='small' className='text-secondaryTextColor mt-[4px]'>{formatSlotLabel(nextAppointment.scheduled_at)}</ThemedText>
          {nextAppointment.symptoms ? <ThemedText size='small' className='text-secondaryTextColor mt-[4px]' numberOfLines={2}>Symptoms: {nextAppointment.symptoms}</ThemedText> : null}
          <View className='mt-[8px]'><StatusBadge status={nextAppointment.status} /></View>
          {canJoin(nextAppointment) ? (
            <PrimaryButton
              title='Join video consultation'
              className='mt-[12px]'
              onPress={() => router.push({
                pathname: '/appointments/[appointmentId]/video' as RelativePathString,
                params: {
                  appointmentId: String(nextAppointment.id),
                  patientName: nextAppointment.patient_name || 'Patient',
                  scheduledAt: nextAppointment.scheduled_at,
                },
              })}
            />
          ) : (
            <Pressable className='mt-[12px]' onPress={() => router.push('/appointments')}>
              <ThemedText className='text-primary font-semibold'>View appointment →</ThemedText>
            </Pressable>
          )}
        </View>
      ) : null}

      <View className='mt-[24px]'>
        <PrimaryButton title='View all appointments' onPress={() => router.push('/appointments')} />
      </View>
    </ScrollView>
  )
}
