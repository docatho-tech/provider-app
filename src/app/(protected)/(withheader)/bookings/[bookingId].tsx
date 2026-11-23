import ThemedText from '@/components/common/ThemedText'
import { ScreenHeader } from '@/components/layout/Headers'
import { Card, CardRow, CardSection } from '@/components/ui/Card'
import {
  ActionButton,
  Avatar,
  Chip,
  CircleIcon,
  CountdownBanner,
  IconPill,
  StickyFooter,
} from '@/components/ui/Primitives'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import useCustomSafeAreaInsets from '@/hooks/useCustomSafeAreaInsets'
import useFileUpload from '@/hooks/useFileUpload'
import { useNow } from '@/hooks/useNow'
import { BOOKING_STATUS, DiagnosticBooking, isBookingPending } from '@/interfaces/healthcare'
import { bookingSlot, visitTypeIcon, visitTypeLabel } from '@/utils/bookingUi'
import { replaceUrlParams } from '@/utils/base'
import { countdownLabel, patientMeta, slotLabel } from '@/utils/schedule'
import Feather from '@expo/vector-icons/Feather'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'

type BookingDetail = DiagnosticBooking & { auto_accept_at?: string | null }

/**
 * One diagnostic booking: who is coming, what they booked, and — once the
 * centre has accepted it — where the reports go.
 *
 * Pending and accepted differ in the banner and the footer, the same split the
 * appointment screen makes, because they are the same decision asked about a
 * different kind of work.
 */
const BookingDetail = () => {
  const { bottom } = useCustomSafeAreaInsets()
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const now = useNow()
  const [updating, setUpdating] = useState(false)
  const { pickAndUpload, isUploading } = useFileUpload()

  const detailUrl = replaceUrlParams(API_ENDPOINTS.DIAGNOSTIC_BOOKING_DETAIL, { bookingId })
  const { requestGET, response: booking, isLoading } = useAxios<BookingDetail>(detailUrl, true)
  const { requestPATCH } = useAxios<BookingDetail>(detailUrl, true)

  useEffect(() => { requestGET() }, [bookingId])

  const patch = async (body: Record<string, unknown>, success: string) => {
    setUpdating(true)
    const res = await requestPATCH(body, detailUrl)
    setUpdating(false)
    if (res.status === 200) {
      Toast.show({ type: 'success', text1: success })
      requestGET()
    }
  }

  const uploadReports = async () => {
    const url = await pickAndUpload()
    if (!url) return
    // PATCH replaces the whole array, so send the existing reports back with it —
    // a multi-test booking's second report used to overwrite the first.
    const reports = [...(booking?.reports ?? []), url]
    await patch({ reports, status: BOOKING_STATUS.REPORT_GENERATED }, 'Report uploaded')
  }

  if (isLoading && !booking) {
    return (
      <View className='flex-1 bg-page'>
        <ScreenHeader title='Booking' />
        <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
      </View>
    )
  }
  if (!booking) {
    return (
      <View className='flex-1 bg-page'>
        <ScreenHeader title='Booking' />
        <ThemedText className='text-center mt-[40px]' style={{ color: Colors.mutedTextColor }}>
          Could not load this booking.
        </ThemedText>
      </View>
    )
  }

  const slot = bookingSlot(booking)
  const pending = isBookingPending(booking.status)
  const meta = patientMeta(booking.patient_age, booking.patient_gender)
  const startsIn = slot ? countdownLabel(slot) : null
  const autoAcceptIn = booking.auto_accept_at ? countdownLabel(booking.auto_accept_at, 'in') : null
  void now

  const call = () => booking.patient_phone && Linking.openURL(`tel:${booking.patient_phone}`)

  return (
    <View className='flex-1 bg-page'>
      <ScreenHeader title={booking.patient_name || 'Booking'} backButtonRoute='/bookings' />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}>
        {pending && autoAcceptIn ? (
          <CountdownBanner text={`Order get auto accept ${autoAcceptIn}`} />
        ) : null}

        <Card>
          <CardRow first>
            <View className='flex-row items-start justify-between'>
              <View className='flex-1 pr-[12px]'>
                <ThemedText size='subheading' className='font-bold'>{booking.patient_name || 'Patient'}</ThemedText>
                {meta ? (
                  <ThemedText size='small' className='mt-[6px]' style={{ color: Colors.secondaryTextColor }}>{meta}</ThemedText>
                ) : null}
              </View>
              <Avatar uri={booking.patient_photo} name={booking.patient_name} size={58} radius={10} />
            </View>
          </CardRow>

          <CardRow>
            <ThemedText size='small' className='font-semibold'>Tests booked</ThemedText>
            <ThemedText size='small' className='mt-[6px]' style={{ color: Colors.secondaryTextColor }}>
              {slot ? slotLabel(slot) : 'Slot not allotted yet'}
            </ThemedText>
          </CardRow>

          <CardRow>
            <View className='flex-row items-center justify-between gap-x-[12px]'>
              <Chip
                tone='primarySoft'
                label={visitTypeLabel(booking.visit_type)}
                icon={visitTypeIcon(booking.visit_type, Colors.primary, 14)}
              />
              <ThemedText size='small' className='flex-1 text-right' style={{ color: Colors.mutedTextColor }} numberOfLines={1}>
                {startsIn ?? (slot ? 'Due now' : 'Awaiting slot')}
              </ThemedText>
            </View>
          </CardRow>
        </Card>

        <Card>
          <CardSection
            icon={<MaterialCommunityIcons name='test-tube' size={16} color={Colors.primaryTextColor} />}
            title='Tests'
          />
          {booking.tests.length === 0 ? (
            <CardRow first>
              <ThemedText size='small' style={{ color: Colors.mutedTextColor }}>No tests on this booking.</ThemedText>
            </CardRow>
          ) : booking.tests.map((test, index) => (
            <CardRow key={test.id} first={index === 0}>
              <View className='flex-row items-center gap-x-[10px]'>
                <MaterialCommunityIcons name='water-outline' size={17} color={Colors.primaryTextColor} />
                <ThemedText size='subheading' className='font-semibold flex-1'>{test.name}</ThemedText>
              </View>
              <View className='flex-row items-center gap-x-[8px] mt-[10px] ml-[27px]'>
                {test.category_name ? <Chip tone='soft' label={test.category_name} /> : null}
                {test.sample_type ? <Chip tone='outline' label={test.sample_type} /> : null}
              </View>
            </CardRow>
          ))}
        </Card>

        <Card>
          <CardSection
            icon={<Feather name='phone' size={15} color={Colors.primaryTextColor} />}
            title='Contact Patient'
          />
          <CardRow first>
            <View className='flex-row items-center justify-between gap-x-[12px]'>
              <View className='flex-1'>
                <ThemedText size='small' style={{ color: Colors.mutedTextColor }}>Phone</ThemedText>
                <ThemedText size='subheading' className='font-semibold mt-[4px]'>
                  {booking.patient_phone || 'Not provided'}
                </ThemedText>
              </View>
              <Pressable onPress={call} disabled={!booking.patient_phone} style={!booking.patient_phone ? { opacity: 0.4 } : undefined}>
                <CircleIcon size={42}><Feather name='phone' size={16} color={Colors.primary} /></CircleIcon>
              </Pressable>
            </View>
          </CardRow>
          {booking.patient_address ? (
            <CardRow>
              <ThemedText size='small' style={{ color: Colors.mutedTextColor }}>Collection address</ThemedText>
              <ThemedText size='small' className='font-semibold mt-[4px]'>{booking.patient_address}</ThemedText>
            </CardRow>
          ) : null}
        </Card>

        {booking.reports.length > 0 ? (
          <Card>
            <CardSection
              icon={<Feather name='file-text' size={15} color={Colors.primaryTextColor} />}
              title={`Reports (${booking.reports.length})`}
            />
            {booking.reports.map((report, index) => (
              <Pressable key={report} onPress={() => Linking.openURL(report)}>
                <CardRow first={index === 0}>
                  <View className='flex-row items-center gap-x-[12px]'>
                    <IconPill><Feather name='file-text' size={17} color={Colors.primary} /></IconPill>
                    <ThemedText size='subheading' className='font-semibold flex-1' numberOfLines={1}>
                      Report {index + 1}
                    </ThemedText>
                    <Feather name='external-link' size={16} color={Colors.mutedTextColor} />
                  </View>
                </CardRow>
              </Pressable>
            ))}
          </Card>
        ) : null}
      </ScrollView>

      <StickyFooter bottomInset={bottom}>
        {pending ? (
          <>
            <View className='flex-1'>
              <ActionButton
                title='Reject'
                tone='danger'
                loading={updating}
                onPress={() => patch({ status: BOOKING_STATUS.CANCELLED }, 'Booking rejected')}
              />
            </View>
            <View className='flex-1'>
              <ActionButton
                title='Accept'
                tone='primary'
                loading={updating}
                onPress={() => patch({ status: BOOKING_STATUS.CONFIRMED }, 'Booking accepted')}
              />
            </View>
          </>
        ) : (
          <View className='flex-1'>
            <ActionButton
              title='Upload Reports'
              tone='primary'
              loading={updating || isUploading}
              onPress={uploadReports}
            />
          </View>
        )}
      </StickyFooter>
    </View>
  )
}

export default BookingDetail
