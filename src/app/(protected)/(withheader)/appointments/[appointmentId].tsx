import ThemedText from '@/components/common/ThemedText'
import { ScreenHeader } from '@/components/layout/Headers'
import { Card, CardRow, CardSection } from '@/components/ui/Card'
import {
  ActionButton,
  Avatar,
  Chip,
  CircleIcon,
  CountdownBanner,
  StickyFooter,
} from '@/components/ui/Primitives'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import useCustomSafeAreaInsets from '@/hooks/useCustomSafeAreaInsets'
import { ProviderAppointment } from '@/interfaces/healthcare'
import { appointmentModeLabel, canJoinVideo, isOnline } from '@/utils/appointmentUi'
import { getFormattedPrice } from '@/utils/base'
import { countdownLabel, dayLabel, patientMeta, slotLabel, timeLabel } from '@/utils/schedule'
import { useNow } from '@/hooks/useNow'
import Feather from '@expo/vector-icons/Feather'
import { RelativePathString, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { replaceUrlParams } from '@/utils/base'

/**
 * One appointment, in whichever of its three states it is in.
 *
 * The states differ in two places only — the banner above the cards and the
 * buttons below them — so they are branches inside one screen rather than three
 * screens. What is in between is the same patient, the same contact details and
 * the same slot however the appointment is going.
 */
const AppointmentDetail = () => {
  const router = useRouter()
  const { bottom } = useCustomSafeAreaInsets()
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>()
  const now = useNow()
  const [updating, setUpdating] = useState(false)

  const detailUrl = replaceUrlParams(API_ENDPOINTS.APPOINTMENT_DETAIL, { appointmentId })
  const { requestGET, response: appointment, isLoading } = useAxios<ProviderAppointment & { auto_accept_at?: string | null }>(detailUrl, true)
  const { requestPATCH } = useAxios(API_ENDPOINTS.APPOINTMENTS)

  useEffect(() => { requestGET() }, [appointmentId])

  const updateStatus = async (status: string) => {
    setUpdating(true)
    const res = await requestPATCH({ appointment_id: Number(appointmentId), status })
    setUpdating(false)
    if (res.status === 200) {
      Toast.show({ type: 'success', text1: status === 'rejected' ? 'Appointment rejected' : 'Appointment accepted' })
      requestGET()
    }
  }

  if (isLoading && !appointment) {
    return (
      <View className='flex-1 bg-page'>
        <ScreenHeader title='Appointment' />
        <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
      </View>
    )
  }
  if (!appointment) {
    return (
      <View className='flex-1 bg-page'>
        <ScreenHeader title='Appointment' />
        <ThemedText className='text-center mt-[40px]' style={{ color: Colors.mutedTextColor }}>
          Could not load this appointment.
        </ThemedText>
      </View>
    )
  }

  const meta = patientMeta(appointment.patient_age, appointment.patient_gender)
  const isPending = appointment.status === 'pending'
  const waiting = appointment.status === 'in_progress'
  const joinable = canJoinVideo(appointment)
  // `now` ticks, so both countdowns re-render rather than freezing at whatever
  // they read when the screen opened.
  const startsIn = countdownLabel(appointment.scheduled_at)
  const autoAcceptIn = appointment.auto_accept_at ? countdownLabel(appointment.auto_accept_at, 'in') : null
  void now

  const title = meta ? `${appointment.patient_name || 'Patient'} - ${meta.split(' • ')[0]}` : (appointment.patient_name || 'Patient')

  const call = () => appointment.patient_phone && Linking.openURL(`tel:${appointment.patient_phone}`)
  const navigate = () => appointment.patient_address
    && Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appointment.patient_address)}`)

  // The prescription is the last step of a consultation, so it appears once one
  // is under way and stays afterwards — a doctor who hung up without writing it
  // still has to be able to.
  const consulted = appointment.status === 'in_progress' || appointment.status === 'completed'
  const openPrescription = () => router.push({
    pathname: '/appointments/[appointmentId]/prescription' as RelativePathString,
    params: { appointmentId: String(appointment.id) },
  })

  const joinVideo = () => router.push({
    pathname: '/appointments/[appointmentId]/video' as RelativePathString,
    params: {
      appointmentId: String(appointment.id),
      patientName: appointment.patient_name || 'Patient',
      scheduledAt: appointment.scheduled_at,
    },
  })

  return (
    <View className='flex-1 bg-page'>
      <ScreenHeader title={title} backButtonRoute='/appointments' />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}>
        {isPending && autoAcceptIn ? (
          <CountdownBanner text={`Consultation get auto accept ${autoAcceptIn}`} />
        ) : null}

        <Card>
          <CardRow first>
            <View className='flex-row items-start justify-between'>
              <View className='flex-1 pr-[12px]'>
                <ThemedText size='subheading' className='font-bold'>{appointment.patient_name || 'Patient'}</ThemedText>
                {meta ? (
                  <ThemedText size='small' className='mt-[6px]' style={{ color: Colors.secondaryTextColor }}>{meta}</ThemedText>
                ) : null}
              </View>
              <Avatar uri={appointment.patient_photo} name={appointment.patient_name} size={58} radius={10} />
            </View>
          </CardRow>

          <CardRow>
            <ThemedText size='small' className='font-semibold'>Appointment date</ThemedText>
            <ThemedText size='small' className='mt-[6px]' style={{ color: Colors.secondaryTextColor }}>
              {slotLabel(appointment.scheduled_at)}
            </ThemedText>
          </CardRow>

          <CardRow>
            <View className='flex-row items-center justify-between gap-x-[12px]'>
              <Chip
                tone='primarySoft'
                label={appointmentModeLabel(appointment.consultation_mode)}
                icon={<Feather name={isOnline(appointment.consultation_mode) ? 'video' : 'home'} size={14} color={Colors.primary} />}
              />
              <ThemedText size='small' className='flex-1 text-right' style={{ color: Colors.mutedTextColor }} numberOfLines={1}>
                {waiting ? 'Waiting in session' : startsIn ?? 'Starting now'}
              </ThemedText>
            </View>
          </CardRow>
        </Card>

        <Card>
          <CardSection
            icon={<Feather name='phone' size={15} color={Colors.primaryTextColor} />}
            title='Contact details'
          />
          <CardRow first>
            <ContactLine
              label='Phone'
              value={appointment.patient_phone || 'Not provided'}
              icon={<Feather name='phone' size={16} color={Colors.primary} />}
              onPress={appointment.patient_phone ? call : undefined}
            />
          </CardRow>
          <CardRow>
            <ContactLine
              label='Location'
              value={appointment.patient_address || 'Not provided'}
              icon={<Feather name='navigation' size={16} color={Colors.primary} />}
              onPress={appointment.patient_address ? navigate : undefined}
            />
          </CardRow>
        </Card>

        {isPending ? (
          <Card>
            <CardSection
              icon={<Feather name='credit-card' size={15} color={Colors.primaryTextColor} />}
              title='Payment Summary'
            />
            <CardRow first>
              <MoneyLine label={isOnline(appointment.consultation_mode) ? 'Online Consultation' : 'Clinic Visit'} value={appointment.fee} />
              <View className='mt-[12px]'>
                <MoneyLine label='Platform fee (incl. of GST)' value={appointment.platform_fee} />
              </View>
            </CardRow>
            <CardRow>
              <MoneyLine label='To be paid' value={appointment.total_payable} strong />
            </CardRow>
          </Card>
        ) : null}

        {!isPending && appointment.previous_consultations?.length ? (
          <Card>
            <CardSection
              icon={<Feather name='credit-card' size={15} color={Colors.primaryTextColor} />}
              title='Previous consultations'
            />
            {appointment.previous_consultations.map((consultation, index) => (
              <CardRow key={consultation.id} first={index === 0}>
                <View className='flex-row items-center gap-x-[12px]'>
                  <Avatar uri={consultation.doctor_photo} name={consultation.doctor_name} size={42} radius={8} />
                  <View className='flex-1'>
                    <ThemedText size='subheading' className='font-semibold'>{consultation.doctor_name}</ThemedText>
                    <ThemedText size='small' className='mt-[3px]' style={{ color: Colors.mutedTextColor }}>
                      {consultation.doctor_specialty}
                    </ThemedText>
                  </View>
                  <View className='items-end'>
                    <ThemedText size='small' className='font-semibold'>{dayLabel(consultation.scheduled_at)}</ThemedText>
                    <ThemedText size='small' className='mt-[3px]' style={{ color: Colors.mutedTextColor }}>
                      {timeLabel(consultation.scheduled_at)}
                    </ThemedText>
                  </View>
                </View>
              </CardRow>
            ))}
          </Card>
        ) : null}
      </ScrollView>

      <StickyFooter bottomInset={bottom}>
        {isPending ? (
          <>
            <View className='flex-1'>
              <ActionButton title='Reject' tone='danger' loading={updating} onPress={() => updateStatus('rejected')} />
            </View>
            <View className='flex-1'>
              <ActionButton title='Accept' tone='primary' loading={updating} onPress={() => updateStatus('confirmed')} />
            </View>
          </>
        ) : consulted ? (
          <>
            <View className='flex-1'>
              <ActionButton
                title={appointment.prescription ? 'View Prescription' : 'Write Prescription'}
                tone={joinable ? 'outlinePrimary' : 'primary'}
                onPress={openPrescription}
              />
            </View>
            {joinable ? (
              <View className='flex-1'>
                <ActionButton title='Join Consultation' tone='primary' onPress={joinVideo} />
              </View>
            ) : null}
          </>
        ) : joinable ? (
          <View className='flex-1'>
            <ActionButton title='Join Consultation' tone='primary' onPress={joinVideo} />
          </View>
        ) : (
          <View className='flex-1'>
            {/* Accepted but not yet open: the button stays, greyed, showing the
                wait — removing it would leave the doctor with no sign that this
                is where they will join from. */}
            <ActionButton title={startsIn ? `Starts ${startsIn.replace('starts ', '')}` : 'Starting now'} tone='disabled' />
          </View>
        )}
      </StickyFooter>
    </View>
  )
}

const ContactLine = ({ label, value, icon, onPress }: {
  label: string
  value: string
  icon: React.ReactNode
  onPress?: () => void
}) => (
  <View className='flex-row items-center justify-between gap-x-[12px]'>
    <View className='flex-1'>
      <ThemedText size='small' style={{ color: Colors.mutedTextColor }}>{label}</ThemedText>
      <ThemedText size='subheading' className='font-semibold mt-[4px]'>{value}</ThemedText>
    </View>
    <Pressable onPress={onPress} disabled={!onPress} style={!onPress ? { opacity: 0.4 } : undefined}>
      <CircleIcon size={42}>{icon}</CircleIcon>
    </Pressable>
  </View>
)

const MoneyLine = ({ label, value, strong = false }: { label: string; value?: string; strong?: boolean }) => (
  <View className='flex-row items-center justify-between'>
    <ThemedText size='subheading' className={strong ? 'font-semibold' : ''} style={strong ? undefined : { color: Colors.secondaryTextColor }}>
      {label}
    </ThemedText>
    <ThemedText size='subheading' className={strong ? 'font-semibold' : ''}>
      {getFormattedPrice(Number(value ?? 0))}
    </ThemedText>
  </View>
)

export default AppointmentDetail
