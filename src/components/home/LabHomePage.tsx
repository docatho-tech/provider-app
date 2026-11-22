import ThemedText from '@/components/common/ThemedText'
import { Card, CardSection } from '@/components/ui/Card'
import { CardLinkRow, EmptyRow, OverviewCard, PersonRow } from '@/components/ui/Lists'
import { SearchField } from '@/components/ui/Primitives'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import { DiagnosticBooking } from '@/interfaces/healthcare'
import {
  bookingMatchesQuery,
  bookingSlot,
  isOpenBooking,
  visitTypeIcon,
} from '@/utils/bookingUi'
import { dayLabel, daysFromToday, patientMetaShort, timeLabel } from '@/utils/schedule'
import Feather from '@expo/vector-icons/Feather'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { RelativePathString, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native'

/**
 * The diagnostic centre's dashboard — the same shape as the doctor's, because
 * a centre's day is the same question asked of a different queue: who is coming
 * in today, who is coming later, and how do I get to the rest.
 */
export default function LabHomePage() {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')
  const { requestGET, response, isLoading } = useAxios<DiagnosticBooking[]>(API_ENDPOINTS.DIAGNOSTIC_BOOKINGS)

  useEffect(() => { requestGET() }, [])
  const onRefresh = async () => { setRefreshing(true); await requestGET(); setRefreshing(false) }

  const { today, upcoming } = useMemo(() => {
    const open = (response ?? [])
      .filter((booking) => isOpenBooking(booking.status))
      .filter((booking) => bookingMatchesQuery(booking, query))
      .filter((booking) => bookingSlot(booking) !== null)
      .sort((a, b) => new Date(bookingSlot(a)!).getTime() - new Date(bookingSlot(b)!).getTime())
    return {
      today: open.filter((booking) => daysFromToday(bookingSlot(booking)!) === 0),
      upcoming: open.filter((booking) => daysFromToday(bookingSlot(booking)!) > 0),
    }
  }, [response, query])

  const openDetail = (booking: DiagnosticBooking) => router.push({
    pathname: '/bookings/[bookingId]' as RelativePathString,
    params: { bookingId: String(booking.id) },
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
        title='Tests Overview'
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
          <EmptyRow text='No tests booked for today' />
        ) : today.slice(0, 3).map((booking, index) => (
          <BookingRow key={booking.id} booking={booking} first={index === 0} onPress={() => openDetail(booking)} />
        ))}
        {/* Cast because expo-router's generated route union is only rebuilt by
            the dev server, and this tab is newer than the checked-in types. */}
        <CardLinkRow label='View all Tests' onPress={() => router.push('/bookings' as RelativePathString)} />
      </Card>

      <Card>
        <CardSection
          icon={<Feather name='calendar' size={16} color={Colors.primaryTextColor} />}
          title='Upcoming Appointments'
        />
        {upcoming.length === 0 ? (
          <EmptyRow text='Nothing coming up' />
        ) : upcoming.slice(0, 3).map((booking, index) => (
          <BookingRow key={booking.id} booking={booking} first={index === 0} onPress={() => openDetail(booking)} />
        ))}
      </Card>
    </ScrollView>
  )
}

export const BookingRow = ({ booking, first, onPress }: {
  booking: DiagnosticBooking
  first?: boolean
  onPress: () => void
}) => {
  const slot = bookingSlot(booking)
  return (
    <PersonRow
      first={first}
      icon={visitTypeIcon(booking.visit_type)}
      name={booking.patient_name || 'Patient'}
      meta={patientMetaShort(booking.patient_age, booking.patient_gender)}
      subtitle={(
        <View className='flex-row items-center gap-x-[10px]'>
          <View className='flex-row items-center gap-x-[5px]'>
            <MaterialCommunityIcons name='test-tube' size={13} color={Colors.secondaryTextColor} />
            <ThemedText size='small' style={{ color: Colors.secondaryTextColor }}>
              {booking.tests.length} {booking.tests.length === 1 ? 'test' : 'tests'}
            </ThemedText>
          </View>
          {slot ? (
            <View className='flex-row items-center gap-x-[5px]'>
              <Feather name='clock' size={12} color={Colors.secondaryTextColor} />
              <ThemedText size='small' style={{ color: Colors.secondaryTextColor }}>{timeLabel(slot)}</ThemedText>
            </View>
          ) : null}
        </View>
      )}
      day={slot ? dayLabel(slot) : 'Unscheduled'}
      time={slot ? timeLabel(slot) : '—'}
      onPress={onPress}
    />
  )
}
