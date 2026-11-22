import { BookingRow } from '@/components/home/LabHomePage'
import { ScreenHeader } from '@/components/layout/Headers'
import { Card, CardSection } from '@/components/ui/Card'
import { EmptyRow, OverviewCard } from '@/components/ui/Lists'
import { SearchField } from '@/components/ui/Primitives'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import { DiagnosticBooking } from '@/interfaces/healthcare'
import { bookingMatchesQuery, bookingSlot, isOpenBooking, isWalkIn } from '@/utils/bookingUi'
import { daysFromToday, groupByDay } from '@/utils/schedule'
import Feather from '@expo/vector-icons/Feather'
import { RelativePathString, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native'

/**
 * Every open booking, grouped by day, with today's split by where the sample is
 * taken — a centre staffs the front desk and the collection round separately,
 * so "12 walk-ins, 10 home pickups" is the number the morning is planned from.
 */
const BookingsTab = () => {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')
  const { requestGET, response, isLoading, error } = useAxios<DiagnosticBooking[]>(API_ENDPOINTS.DIAGNOSTIC_BOOKINGS)

  useEffect(() => { requestGET() }, [])
  const onRefresh = async () => { setRefreshing(true); await requestGET(); setRefreshing(false) }

  const { groups, walkIns, homePickups } = useMemo(() => {
    const open = (response ?? [])
      .filter((booking) => isOpenBooking(booking.status))
      .filter((booking) => bookingMatchesQuery(booking, query))
      .filter((booking) => bookingSlot(booking) !== null)
      .sort((a, b) => new Date(bookingSlot(a)!).getTime() - new Date(bookingSlot(b)!).getTime())
    const today = open.filter((booking) => daysFromToday(bookingSlot(booking)!) === 0)
    return {
      groups: groupByDay(open, bookingSlot),
      walkIns: today.filter((booking) => isWalkIn(booking.visit_type)).length,
      homePickups: today.filter((booking) => !isWalkIn(booking.visit_type)).length,
    }
  }, [response, query])

  const openDetail = (booking: DiagnosticBooking) => router.push({
    pathname: '/bookings/[bookingId]' as RelativePathString,
    params: { bookingId: String(booking.id) },
  })

  return (
    <View className='flex-1 bg-page'>
      <ScreenHeader title='All Tests' backButtonRoute='/' />
      {isLoading && !response ? (
        <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          <SearchField value={query} onChangeText={setQuery} />

          <OverviewCard
            title="Today's Overview"
            left={{
              value: walkIns,
              label: 'Walk-ins',
              icon: <Feather name='thermometer' size={14} color={Colors.primary} />,
            }}
            right={{
              value: homePickups,
              label: 'Home pickup',
              icon: <Feather name='home' size={14} color={Colors.primary} />,
            }}
          />

          {groups.length === 0 ? (
            <Card>
              <CardSection
                icon={<Feather name='calendar' size={16} color={Colors.primaryTextColor} />}
                title='Tests'
              />
              <EmptyRow text={error ? 'Could not load bookings. Pull to refresh.' : 'No tests booked'} />
            </Card>
          ) : groups.map((group, groupIndex) => (
            <Card key={group.label}>
              <CardSection
                icon={<Feather name='calendar' size={16} color={Colors.primaryTextColor} />}
                // The first group is the day being worked, so it is titled as
                // such; the ones after it are named by their day and counted.
                title={groupIndex === 0 && group.label === 'Today' ? "Today's tests" : `${group.label} (${group.rows.length})`}
              />
              {group.rows.map((booking, index) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  first={index === 0}
                  onPress={() => openDetail(booking)}
                />
              ))}
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

export default BookingsTab
