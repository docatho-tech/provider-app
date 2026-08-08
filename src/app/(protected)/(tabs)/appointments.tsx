import PrimaryButton from '@/components/common/PrimaryButton'
import ThemedText from '@/components/common/ThemedText'
import AppointmentStatusStepper from '@/components/healthcare/AppointmentStatusStepper'
import StatusBadge from '@/components/healthcare/StatusBadge'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import { formatSlotLabel } from '@/utils/appointmentUi'
import { RelativePathString, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, TextInput, View } from 'react-native'

interface Appointment {
  id: number
  patient_name?: string
  scheduled_at: string
  status: string
  consultation_mode: string
  symptoms: string
  notes?: string
  prescription_notes?: string
  fee?: string
  payment_status?: string
}

const TABS = ['pending', 'confirmed', 'completed'] as const

const canJoinVideoConsultation = (appointment: Appointment) => (
  appointment.consultation_mode === 'online'
  && appointment.payment_status === 'paid'
  && ['confirmed', 'in_progress'].includes(appointment.status)
)

const AppointmentsTab = () => {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tab, setTab] = useState<(typeof TABS)[number]>('pending')
  const [notesId, setNotesId] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const { requestGET, isLoading, error } = useAxios<Appointment[]>(API_ENDPOINTS.APPOINTMENTS)
  const { requestPATCH } = useAxios(API_ENDPOINTS.APPOINTMENTS)

  const load = () => requestGET().then((r) => { if (r.status === 200) setAppointments(r.data) })
  useEffect(() => { load() }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const openDetail = (a: Appointment) => {
    router.push({
      pathname: '/appointments/[appointmentId]' as RelativePathString,
      params: {
        appointmentId: String(a.id),
        patient_name: a.patient_name || 'Patient',
        scheduled_at: a.scheduled_at,
        status: a.status,
        consultation_mode: a.consultation_mode,
        symptoms: a.symptoms || '',
        notes: a.notes || '',
        prescription_notes: a.prescription_notes || '',
        fee: a.fee || '',
        payment_status: a.payment_status || '',
      },
    })
  }

  const joinVideo = (a: Appointment) => {
    router.push({
      pathname: '/appointments/[appointmentId]/video' as RelativePathString,
      params: {
        appointmentId: String(a.id),
        patientName: a.patient_name || 'Patient',
        scheduledAt: a.scheduled_at,
      },
    })
  }

  const confirmUpdate = (id: number, status: string, prescription_notes?: string) => {
    if (status === 'rejected') {
      Alert.alert('Reject appointment?', 'The patient will be notified.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => updateStatus(id, status, prescription_notes) },
      ])
      return
    }
    if (status === 'confirmed') {
      Alert.alert('Accept appointment?', 'Confirm this consultation slot.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: () => updateStatus(id, status, prescription_notes) },
      ])
      return
    }
    updateStatus(id, status, prescription_notes)
  }
  const updateStatus = async (id: number, status: string, prescription_notes?: string) => {
    const body: Record<string, unknown> = { appointment_id: id, status }
    if (prescription_notes !== undefined) body.prescription_notes = prescription_notes
    await requestPATCH(body)
    setNotesId(null)
    setNotes('')
    load()
  }

  const filtered = appointments.filter((a) => {
    if (tab === 'completed') return a.status === 'completed'
    if (tab === 'confirmed') return ['confirmed', 'in_progress'].includes(a.status)
    return a.status === 'pending'
  })

  if (isLoading && appointments.length === 0) return <ActivityIndicator className='mt-[40px]' color={Colors.primary} />

  return (
    <ScrollView className='flex-1 bg-[#F7F9FC] px-[5%] pt-[10px]'
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
      <View className='flex-row gap-[8px] mb-[12px]'>
        {TABS.map((t) => (
          <Pressable key={t} className={`px-[12px] py-[6px] rounded-full ${tab === t ? 'bg-primary' : 'bg-white border border-primary/20'}`} onPress={() => setTab(t)}>
            <ThemedText size='small' className={tab === t ? 'text-white capitalize' : 'capitalize'}>{t}</ThemedText>
          </Pressable>
        ))}
      </View>
      {error && filtered.length === 0 ? (
        <ThemedText className='text-center text-secondaryTextColor mt-[40px]'>Could not load appointments. Pull to refresh.</ThemedText>
      ) : filtered.length === 0 ? (
        <ThemedText className='text-center text-secondaryTextColor mt-[40px]'>No appointments</ThemedText>
      ) : filtered.map((a) => (
        <View key={a.id} className='bg-white rounded-[12px] p-[14px] mt-[10px] border border-primary/10'>
          <Pressable onPress={() => openDetail(a)}>
            <View className='flex-row justify-between items-start'>
              <View className='flex-1'>
                <ThemedText className='font-semibold'>{a.patient_name || 'Patient'}</ThemedText>
                <ThemedText size='small' className='text-secondaryTextColor mt-[4px]'>{formatSlotLabel(a.scheduled_at)}</ThemedText>
              </View>
              <StatusBadge status={a.status} />
            </View>
            <ThemedText size='small' className='capitalize mt-[8px] text-primary'>{a.consultation_mode.replace('_', ' ')}</ThemedText>
            {a.payment_status ? (
              <ThemedText size='small' className='mt-[4px] text-secondaryTextColor capitalize'>Payment: {a.payment_status.replace('_', ' ')}</ThemedText>
            ) : null}
            <AppointmentStatusStepper appointment={{ status: a.status, payment_status: a.payment_status, consultation_mode: a.consultation_mode }} />
            {a.symptoms ? <ThemedText size='small' className='mt-[4px] text-secondaryTextColor' numberOfLines={2}>Symptoms: {a.symptoms}</ThemedText> : null}
          </Pressable>
          {canJoinVideoConsultation(a) ? (
            <View className='mt-[12px] bg-[#EEF4FF] rounded-[10px] p-[10px] border border-primary/20'>
              <ThemedText size='small' className='text-primary font-semibold mb-[8px]'>Video consultation ready</ThemedText>
              <PrimaryButton title='Join now' onPress={() => joinVideo(a)} />
            </View>
          ) : null}
          {a.status === 'pending' && (
            <View className='flex-row gap-[8px] mt-[10px]'>
              <PrimaryButton title='Accept' className='flex-1' onPress={() => confirmUpdate(a.id, 'confirmed')} />
              <Pressable className='flex-1 border border-red-300 rounded-default items-center justify-center' onPress={() => confirmUpdate(a.id, 'rejected')}>
                <ThemedText className='text-red-500'>Reject</ThemedText>
              </Pressable>
            </View>
          )}
          {['confirmed', 'in_progress'].includes(a.status) && (
            <View className='mt-[10px] gap-[8px]'>
              {notesId === a.id ? (
                <>
                  <TextInput className='border border-primary/20 rounded-[8px] p-[10px] min-h-[60px]' multiline value={notes} onChangeText={setNotes} placeholder='Prescription notes' />
                  <PrimaryButton title='Mark Complete' onPress={() => updateStatus(a.id, 'completed', notes)} />
                </>
              ) : (
                <PrimaryButton title='Add Rx & Complete' onPress={() => { setNotesId(a.id); setNotes(a.prescription_notes || '') }} />
              )}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  )
}
export default AppointmentsTab
