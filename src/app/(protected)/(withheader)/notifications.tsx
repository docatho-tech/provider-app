import ThemedText from '@/components/common/ThemedText'
import CustomFlatList from '@/components/general/CustomFlatList'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import { NotificationItem, PaginatedNotifications } from '@/interfaces/provider'
import { getNextPageNumberFromURL, replaceUrlParams } from '@/utils/base'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, View } from 'react-native'

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const { requestGET, isLoading, error } = useAxios<PaginatedNotifications>(API_ENDPOINTS.NOTIFICATIONS, true)
  const { requestPOST: markAllRead } = useAxios(API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ)
  const { requestPOST: markRead } = useAxios(API_ENDPOINTS.NOTIFICATION_MARK_READ)

  const load = useCallback(async (page = 1, append = false) => {
    const res = await requestGET({ page, page_size: 20 })
    if (res.status === 200) {
      setNotifications((prev) => append ? [...prev, ...res.data.results] : res.data.results)
      setNextUrl(res.data.next)
    }
  }, [])

  useEffect(() => { load() }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await load(1, false)
    setRefreshing(false)
  }

  const handleMarkAllRead = async () => {
    const res = await markAllRead({})
    if (res.status === 200) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    }
  }

  const handleMarkRead = async (item: NotificationItem) => {
    if (item.is_read) return
    const url = replaceUrlParams(API_ENDPOINTS.NOTIFICATION_MARK_READ, { notificationId: item.id })
    const res = await markRead({}, {}, url)
    if (res.status === 200) {
      setNotifications((prev) => prev.map((n) => n.id === item.id ? { ...n, is_read: true } : n))
    }
  }

  const handlePageChange = () => {
    if (!nextUrl) return null
    const page = getNextPageNumberFromURL(nextUrl)
    if (page) load(page, true)
    return page
  }

  if (isLoading && notifications.length === 0) {
    return <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
  }

  return (
    <View className='flex-1 bg-[#F7F9FC]'>
      {notifications.some((n) => !n.is_read) && (
        <Pressable className='px-[5%] py-[12px] items-end' onPress={handleMarkAllRead}>
          <ThemedText className='text-primary font-semibold'>Mark all read</ThemedText>
        </Pressable>
      )}
      <CustomFlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        gap={10}
        renderItem={({ item }) => (
          <Pressable
            className={`mx-[5%] rounded-[12px] p-[14px] border ${item.is_read ? 'bg-white border-primary/10' : 'bg-primary/5 border-primary/20'}`}
            onPress={() => handleMarkRead(item)}
          >
            <ThemedText className='font-semibold'>{item.title}</ThemedText>
            <ThemedText size='small' className='text-secondaryTextColor mt-[4px]'>{item.body}</ThemedText>
            <ThemedText size='small' className='text-secondaryTextColor mt-[8px]'>
              {new Date(item.created_at).toLocaleString()}
            </ThemedText>
          </Pressable>
        )}
        ListHeaderComponent={<View className='h-[10px]' />}
        ListFooterComponent={<View className='h-[20px]' />}
        ListEmptyComponent={
          <View className='px-[5%] mt-[40px] items-center'>
            <ThemedText className='text-secondaryTextColor'>
              {error ? 'Could not load notifications' : 'No notifications yet'}
            </ThemedText>
          </View>
        }
        useInfiniteScroll={!!nextUrl}
        infiniteScrollAction={handlePageChange}
        extraProps={{
          refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />,
        }}
      />
    </View>
  )
}

export default NotificationsScreen
