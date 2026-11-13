import ThemedText from '@/components/common/ThemedText'
import { Card, CardRow } from '@/components/ui/Card'
import { ActionButton, FilterChip, IconPill, Stars } from '@/components/ui/Primitives'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import { NotificationItem, PaginatedNotifications } from '@/interfaces/provider'
import { getNextPageNumberFromURL, replaceUrlParams } from '@/utils/base'
import {
  NOTIFICATION_FILTERS,
  NotificationFilter,
  NotificationView,
  filterParams,
  notificationView,
} from '@/utils/notificationUi'
import { groupByRecency, timeLabel } from '@/utils/schedule'
import Feather from '@expo/vector-icons/Feather'
import { RelativePathString, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'

/**
 * Everything that has happened to the partner's queue, newest first, under a
 * filter strip and grouped into Today / Last week / Other.
 *
 * A notification here is not only a message — the rows the design draws are the
 * shortest route to the action they are about, so a request is answered from
 * this screen and a waiting patient is joined from it. Where a row has no action
 * it opens the thing it is about instead.
 */
const NotificationsScreen = () => {
  const router = useRouter()
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [answering, setAnswering] = useState<number | null>(null)

  const { requestGET, isLoading, error } = useAxios<PaginatedNotifications>(API_ENDPOINTS.NOTIFICATIONS, true)
  const { requestPOST: markRead } = useAxios(API_ENDPOINTS.NOTIFICATION_MARK_READ)
  const { requestPATCH: updateAppointment } = useAxios(API_ENDPOINTS.APPOINTMENTS)

  const load = useCallback(async (page = 1, append = false) => {
    const res = await requestGET({ page, page_size: 20, ...filterParams(filter) })
    if (res.status === 200) {
      setNotifications((prev) => append ? [...prev, ...res.data.results] : res.data.results)
      setNextUrl(res.data.next)
    }
  }, [filter])

  // Clear before reloading: leaving the previous filter's rows up while the new
  // ones arrive shows the wrong answer to the tab that is already highlighted.
  useEffect(() => { setNotifications([]); load() }, [filter])

  const onRefresh = async () => {
    setRefreshing(true)
    await load(1, false)
    setRefreshing(false)
  }

  const loadMore = () => {
    if (!nextUrl) return
    const page = getNextPageNumberFromURL(nextUrl)
    if (page) load(page, true)
  }

  const markOneRead = async (item: NotificationItem) => {
    if (item.is_read) return
    const url = replaceUrlParams(API_ENDPOINTS.NOTIFICATION_MARK_READ, { notificationId: item.id })
    const res = await markRead({}, {}, url)
    if (res.status === 200) {
      setNotifications((prev) => prev.map((n) => n.id === item.id ? { ...n, is_read: true } : n))
    }
  }

  const answer = async (item: NotificationItem, appointmentId: number, status: string) => {
    setAnswering(item.id)
    const res = await updateAppointment({ appointment_id: appointmentId, status })
    setAnswering(null)
    if (res.status === 200) {
      Toast.show({ type: 'success', text1: status === 'rejected' ? 'Appointment rejected' : 'Appointment approved' })
      markOneRead(item)
      load(1, false)
    }
  }

  const openSubject = (item: NotificationItem, view: NotificationView) => {
    markOneRead(item)
    if (view.appointmentId) {
      router.push({
        pathname: '/appointments/[appointmentId]' as RelativePathString,
        params: { appointmentId: String(view.appointmentId) },
      })
    } else if (item.order) {
      router.push(`/orders/${item.order}` as RelativePathString)
    }
  }

  const join = (item: NotificationItem, appointmentId: number) => {
    markOneRead(item)
    router.push({
      pathname: '/appointments/[appointmentId]/video' as RelativePathString,
      params: {
        appointmentId: String(appointmentId),
        patientName: String(item.data?.patient_name ?? 'Patient'),
        scheduledAt: String(item.data?.scheduled_at ?? ''),
      },
    })
  }

  const groups = useMemo(() => groupByRecency(notifications, (item) => item.created_at), [notifications])

  return (
    <View className='flex-1 bg-page'>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className='flex-grow-0'
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}
      >
        {NOTIFICATION_FILTERS.map((item) => (
          <FilterChip
            key={item.value}
            label={item.label}
            active={filter === item.value}
            onPress={() => setFilter(item.value)}
          />
        ))}
      </ScrollView>

      {isLoading && notifications.length === 0 ? (
        <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          onMomentumScrollEnd={loadMore}
        >
          {groups.length === 0 ? (
            <ThemedText className='text-center mt-[40px]' style={{ color: Colors.mutedTextColor }}>
              {error ? 'Could not load notifications' : 'Nothing here yet'}
            </ThemedText>
          ) : groups.map((group) => (
            <View key={group.label}>
              <ThemedText size='subheading' className='font-bold mb-[10px]'>{group.label}</ThemedText>
              <Card>
                {group.rows.map((item, index) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    first={index === 0}
                    busy={answering === item.id}
                    onOpen={openSubject}
                    onAnswer={answer}
                    onJoin={join}
                  />
                ))}
              </Card>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const NotificationRow = ({ item, first, busy, onOpen, onAnswer, onJoin }: {
  item: NotificationItem
  first: boolean
  busy: boolean
  onOpen: (item: NotificationItem, view: NotificationView) => void
  onAnswer: (item: NotificationItem, appointmentId: number, status: string) => void
  onJoin: (item: NotificationItem, appointmentId: number) => void
}) => {
  const view = notificationView(item)
  const title = <ThemedText size='standard' className='font-bold'>{item.title}</ThemedText>
  const body = item.body
    ? <ThemedText size='small' style={{ color: Colors.mutedTextColor }}>{item.body}</ThemedText>
    : null

  return (
    <CardRow first={first}>
      <Pressable className='flex-row gap-x-[12px]' onPress={() => onOpen(item, view)}>
        <IconPill size={32}>
          <Feather name={view.icon} size={15} color={Colors.primary} />
        </IconPill>

        <View className='flex-1'>
          <View className='flex-row items-start gap-x-[10px]'>
            <View className='flex-1'>
              {view.eyebrow ? (
                <ThemedText size='small' className='text-primary mb-[2px]'>{view.eyebrow}</ThemedText>
              ) : null}
              {view.bodyFirst ? <>{body}{title}</> : <>{title}{body}</>}
            </View>
            <ThemedText size='small' style={{ color: Colors.mutedTextColor }}>{timeLabel(item.created_at)}</ThemedText>
          </View>

          <RowAction item={item} view={view} busy={busy} onAnswer={onAnswer} onJoin={onJoin} />
        </View>
      </Pressable>
    </CardRow>
  )
}

/** The buttons, stars or nothing that close a row, by what the row is about. */
const RowAction = ({ item, view, busy, onAnswer, onJoin }: {
  item: NotificationItem
  view: NotificationView
  busy: boolean
  onAnswer: (item: NotificationItem, appointmentId: number, status: string) => void
  onJoin: (item: NotificationItem, appointmentId: number) => void
}) => {
  const router = useRouter()

  if (view.action === 'rating') {
    return <View className='mt-[8px]'><Stars value={view.rating} /></View>
  }

  if (view.action === 'approve' && view.appointmentId) {
    return (
      <View className='flex-row items-center gap-x-[10px] mt-[12px]'>
        <ActionButton
          title='Reject'
          tone='neutral'
          size='sm'
          loading={busy}
          onPress={() => onAnswer(item, view.appointmentId!, 'rejected')}
        />
        <ActionButton
          title='Approve'
          tone='success'
          size='sm'
          loading={busy}
          onPress={() => onAnswer(item, view.appointmentId!, 'confirmed')}
        />
      </View>
    )
  }

  if (view.action === 'join' && view.appointmentId) {
    return (
      <View className='flex-row mt-[12px]'>
        <ActionButton
          title='Join consultation'
          tone='primary'
          size='sm'
          icon={<Feather name='video' size={15} color='#FFFFFF' />}
          onPress={() => onJoin(item, view.appointmentId!)}
        />
      </View>
    )
  }

  if (view.action === 'notes' && view.appointmentId) {
    return (
      <View className='flex-row mt-[12px]'>
        <ActionButton
          title='Add notes'
          tone='neutral'
          size='sm'
          onPress={() => router.push({
            pathname: '/appointments/[appointmentId]' as RelativePathString,
            params: { appointmentId: String(view.appointmentId) },
          })}
        />
      </View>
    )
  }

  return null
}

export default NotificationsScreen
