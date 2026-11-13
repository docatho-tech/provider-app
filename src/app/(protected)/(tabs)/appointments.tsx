import { ScreenHeader } from '@/components/layout/Headers'
import { Card, CardSection } from '@/components/ui/Card'
import { EmptyRow, OverviewCard } from '@/components/ui/Lists'
import { SearchField } from '@/components/ui/Primitives'
import { AppointmentRow } from '@/components/home/DoctorHomePage'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import { ProviderAppointment } from '@/interfaces/healthcare'
import { isOnline, isOpenAppointment, matchesQuery } from '@/utils/appointmentUi'
import { groupByDay } from '@/utils/schedule'
import Feather from '@expo/vector-icons/Feather'
import { RelativePathString, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native'

/**
 * Every open appointment, grouped into one card per day.
 *
 * The grouping is the screen: a flat list sorted by time reads the same whether
 * the next row is in ten minutes or next Tuesday, which is the one thing a
 * doctor checking their day needs to be able to tell apart.
 */
const AppointmentsTab = () => {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')
  const { requestGET, response, isLoading, error } = useAxios<ProviderAppointment[]>(API_ENDPOINTS.APPOINTMENTS)

  useEffect(() => { requestGET() }, [])
  const onRefresh = async () => { setRefreshing(true); await requestGET(); setRefreshing(false) }

  const { groups, inClinic, online } = useMemo(() => {
    const open = (response ?? [])
      .filter((a) => isOpenAppointment(a.status))
      .filter((a) => matchesQuery(a, query))
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    return {
      groups: groupByDay(open, (a) => a.scheduled_at),
      inClinic: open.filter((a) => !isOnline(a.consultation_mode)).length,
      online: open.filter((a) => isOnline(a.consultation_mode)).length,
    }
  }, [response, query])

  const openDetail = (appointment: ProviderAppointment) => router.push({
    pathname: '/appointments/[appointmentId]' as RelativePathString,
    params: { appointmentId: String(appointment.id) },
  })

  return (
    <View className='flex-1 bg-page'>
      <ScreenHeader title='All Appointments' backButtonRoute='/' />
      {isLoading && !response ? (
        <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          <SearchField value={query} onChangeText={setQuery} />

          <OverviewCard
            title='Appointments  Overview'
            left={{
              value: inClinic,
              label: 'In-Clinic visits',
              icon: <Feather name='home' size={14} color={Colors.primary} />,
            }}
            right={{
              value: online,
              label: 'Online Consult.',
              icon: <Feather name='video' size={14} color={Colors.primary} />,
            }}
          />

          {groups.length === 0 ? (
            <Card>
              <CardSection
                icon={<Feather name='calendar' size={16} color={Colors.primaryTextColor} />}
                title='Appointments'
              />
              <EmptyRow text={error ? 'Could not load appointments. Pull to refresh.' : 'No appointments'} />
            </Card>
          ) : groups.map((group) => (
            <Card key={group.label}>
              <CardSection
                icon={<Feather name='calendar' size={16} color={Colors.primaryTextColor} />}
                title={`${group.label} (${group.rows.length})`}
              />
              {group.rows.map((appointment, index) => (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                  first={index === 0}
                  onPress={() => openDetail(appointment)}
                />
              ))}
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

export default AppointmentsTab
