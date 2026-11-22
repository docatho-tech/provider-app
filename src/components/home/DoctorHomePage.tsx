import ThemedText from '@/components/common/ThemedText'
import { Card, CardSection } from '@/components/ui/Card'
import { CardLinkRow, EmptyRow, OverviewCard, PersonRow } from '@/components/ui/Lists'
import { SearchField } from '@/components/ui/Primitives'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import { ProviderAppointment } from '@/interfaces/healthcare'
import {
  appointmentModeIcon,
  appointmentModeLabel,
  isOpenAppointment,
  matchesQuery,
} from '@/utils/appointmentUi'
import { dayLabel, daysFromToday, patientMetaShort, timeLabel } from '@/utils/schedule'
import Feather from '@expo/vector-icons/Feather'
import { RelativePathString, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native'

/**
 * The doctor's dashboard: what is happening today, what is coming, and a way
 * into the full list. It deliberately shows only the first three of each — the
 * "View all Appointments" row is the way to the rest.
 */
export default function DoctorHomePage() {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')
  const { requestGET, response, isLoading } = useAxios<ProviderAppointment[]>(API_ENDPOINTS.APPOINTMENTS)

  useEffect(() => { requestGET() }, [])
  const onRefresh = async () => { setRefreshing(true); await requestGET(); setRefreshing(false) }

  const { today, upcoming } = useMemo(() => {
    const open = (response ?? [])
      .filter((a) => isOpenAppointment(a.status))
      .filter((a) => matchesQuery(a, query))
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    return {
      today: open.filter((a) => daysFromToday(a.scheduled_at) === 0),
      upcoming: open.filter((a) => daysFromToday(a.scheduled_at) > 0),
    }
  }, [response, query])

  const openDetail = (appointment: ProviderAppointment) => router.push({
    pathname: '/appointments/[appointmentId]' as RelativePathString,
    params: { appointmentId: String(appointment.id) },
  })

  if (isLoading && !response) return <ActivityIndicator className='mt-[40px]' color={Colors.primary} />

  return (
    <ScrollView
      className='flex-1 bg-page'
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <SearchField value={query} onChangeText={setQuery} />

      <OverviewCard
        title='Appointments  Overview'
        left={{ value: today.length, label: "Today's" }}
        right={{ value: upcoming.length, label: 'Upcoming' }}
        alertRight
      />

      <Card>
        <CardSection
          icon={<Feather name='calendar' size={16} color={Colors.primaryTextColor} />}
          title="Today's Appointments"
        />
        {today.length === 0 ? (
          <EmptyRow text='Nothing booked for today' />
        ) : today.slice(0, 3).map((appointment, index) => (
          <AppointmentRow
            key={appointment.id}
            appointment={appointment}
            first={index === 0}
            onPress={() => openDetail(appointment)}
          />
        ))}
        <CardLinkRow label='View all Appointments' onPress={() => router.push('/appointments')} />
      </Card>

      <Card>
        <CardSection
          icon={<Feather name='calendar' size={16} color={Colors.primaryTextColor} />}
          title='Upcoming Appointments'
        />
        {upcoming.length === 0 ? (
          <EmptyRow text='Nothing coming up' />
        ) : upcoming.slice(0, 3).map((appointment, index) => (
          <AppointmentRow
            key={appointment.id}
            appointment={appointment}
            first={index === 0}
            onPress={() => openDetail(appointment)}
          />
        ))}
      </Card>
    </ScrollView>
  )
}

export const AppointmentRow = ({ appointment, first, onPress }: {
  appointment: ProviderAppointment
  first?: boolean
  onPress: () => void
}) => (
  <PersonRow
    first={first}
    icon={appointmentModeIcon(appointment.consultation_mode)}
    name={appointment.patient_name || 'Patient'}
    meta={patientMetaShort(appointment.patient_age, appointment.patient_gender)}
    subtitle={(
      <ThemedText size='small' style={{ color: Colors.secondaryTextColor }}>
        {appointmentModeLabel(appointment.consultation_mode)}
      </ThemedText>
    )}
    day={dayLabel(appointment.scheduled_at)}
    time={timeLabel(appointment.scheduled_at)}
    onPress={onPress}
  />
)
