import ThemedText from '@/components/common/ThemedText'
import { Card, CardRow } from '@/components/ui/Card'
import { ActionButton, Chip, IconPill, SearchField } from '@/components/ui/Primitives'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import Box from '@/components/icons/Box'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import {
  ESTIMATED_DELIVERY_MINUTES,
  ORDER_STATUS,
  isInProgressOrderStatus,
} from '@/constants/base'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import useDownloadInvoice from '@/hooks/useDownloadInvoice'
import { iOrder, iOrderListResponse } from '@/interfaces/order'
import { getFormattedPrice, getNextPageNumberFromURL, replaceUrlParams } from '@/utils/base'
import { itemQuantityLabel, orderStatusChip } from '@/utils/orderUi'
import { timeLabel } from '@/utils/schedule'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, View } from 'react-native'
import Toast from 'react-native-toast-message'
import Confirmation from '../common/Confirmation'
import CustomFlatList from '../general/CustomFlatList'
import Select from '../general/Select'

/**
 * The three tabs, named by the server's bucket rather than by a status.
 *
 * "In Progress" is five statuses, so it never was one — the tab used to fetch
 * every order and drop the non-matching ones from the page it got back, which
 * showed whichever of those ten rows happened to be in progress.
 */
export const TAB_ITEMS = Object.freeze({
  new: { label: 'New', value: 'new' },
  inProgress: { label: 'In Progress', value: 'in_progress' },
  completed: { label: 'Completed', value: 'completed' },
})

/**
 * The pharmacy's queue, in three buckets.
 *
 * The buckets are not three filters over one card — each shows a different
 * thing, because a pharmacy asks a different question of each. A new order
 * needs the address and the bill before it can be accepted; one in transit
 * needs the rider and the ETA; a delivered one needs the money and the invoice.
 */
export default function ChemistHomePage() {
  const { requestGET: getOrderList, response: orderListResponse, isLoading, error } = useAxios<iOrderListResponse>(API_ENDPOINTS.ORDER_LIST, true)
  const { requestPATCH: updateOrderStatus } = useAxios<iOrder>(API_ENDPOINTS.UPDATE_ORDER_STATUS, true)

  const [selectedStatus, setSelectedStatus] = useState<string>(TAB_ITEMS.new.value)
  const [query, setQuery] = useState('')
  const [deliveryTarget, setDeliveryTarget] = useState<{ orderID: number; minutes: number | null } | null>(null)
  const [showSelect, setShowSelect] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [actionOrderId, setActionOrderId] = useState<number | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ title: string; description: string; onConfirm: () => void } | null>(null)

  const loadOrders = useCallback(
    (page = 1) => getOrderList({ page, page_size: 10, bucket: selectedStatus }),
    [selectedStatus, getOrderList],
  )

  useEffect(() => { loadOrders(1) }, [selectedStatus])

  const displayedOrders = useMemo(() => {
    const results = orderListResponse?.results || []
    const needle = query.trim().toLowerCase()
    if (!needle) return results
    return results.filter((order) => [order.order_number, order.user_name]
      .some((field) => (field ?? '').toLowerCase().includes(needle)))
  }, [orderListResponse, query])

  useEffect(() => {
    if (deliveryTarget?.minutes) handleMarkAsDelivered(deliveryTarget.orderID, deliveryTarget.minutes)
  }, [deliveryTarget])

  const formattedDeliveryMinutes = useMemo(() => (
    Object.values(ESTIMATED_DELIVERY_MINUTES).map((item) => ({ label: item.label, value: item.value.toString() }))
  ), [])

  const handlePageChange = () => {
    if (!orderListResponse?.next) return null
    const nextPageNumber = getNextPageNumberFromURL(orderListResponse.next)
    if (nextPageNumber) loadOrders(nextPageNumber)
    return nextPageNumber
  }

  const handleStatusUpdate = async (orderId: number, status: string, successMessage: string) => {
    setActionOrderId(orderId)
    const localURL = replaceUrlParams(API_ENDPOINTS.UPDATE_ORDER_STATUS, { orderId })
    const response = await updateOrderStatus({ status }, localURL)
    setActionOrderId(null)
    if (response.status === 200) {
      Toast.show({ text1: successMessage, type: 'success' })
      loadOrders(1)
    }
  }

  const handleMarkAsDelivered = async (orderId: number, minutes: number) => {
    setShowSelect(false)
    setActionOrderId(orderId)
    const localURL = replaceUrlParams(API_ENDPOINTS.UPDATE_ORDER_STATUS, { orderId })
    const response = await updateOrderStatus(
      { status: ORDER_STATUS.DELIVERED, estimated_delivery_mins: minutes },
      localURL,
    )
    setActionOrderId(null)
    if (response.status === 200) {
      setDeliveryTarget(null)
      Toast.show({ text1: 'Order marked as delivered', type: 'success' })
      loadOrders(1)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadOrders(1)
    setRefreshing(false)
  }

  // Every tab carries its own number, as the design shows them: the list
  // response counts all three buckets, not just the one being read.
  const counts = orderListResponse?.counts
  const tabs = Object.values(TAB_ITEMS).map((tab) => ({
    label: tab.label,
    value: tab.value,
    count: counts?.[tab.value as keyof typeof counts],
  }))

  return (
    <View className='flex-1 bg-page'>
      <View className='px-[16px] pt-[16px] gap-[12px]'>
        <SearchField placeholder='Search for appointments' value={query} onChangeText={setQuery} />
        <SegmentedTabs tabs={tabs} value={selectedStatus} onChange={setSelectedStatus} />
      </View>

      {isLoading && !orderListResponse ? (
        <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
      ) : (
        <CustomFlatList
          data={displayedOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className='px-[16px]'>
              <OrderCard
                order={item}
                isUpdating={actionOrderId === item.id}
                onAccept={() => setConfirmAction({
                  title: 'Accept order?',
                  description: 'You will start processing this order.',
                  onConfirm: () => handleStatusUpdate(item.id, ORDER_STATUS.APPROVED, 'Order accepted'),
                })}
                onReject={() => setConfirmAction({
                  title: 'Reject order?',
                  description: 'The customer will be notified.',
                  onConfirm: () => handleStatusUpdate(item.id, ORDER_STATUS.REJECTED, 'Order rejected'),
                })}
                onMarkDelivered={() => {
                  setDeliveryTarget({ orderID: item.id, minutes: null })
                  setShowSelect(true)
                }}
              />
            </View>
          )}
          gap={16}
          ListHeaderComponent={<View className='mt-[16px]' />}
          ListFooterComponent={<View className='mb-[16px]' />}
          ListEmptyComponent={
            <View className='flex-1 justify-center items-center py-[40px]'>
              <ThemedText style={{ color: Colors.mutedTextColor }}>
                {error ? 'Could not load orders. Pull to refresh.' : 'No orders in this list'}
              </ThemedText>
            </View>
          }
          useInfiniteScroll={!!orderListResponse?.next}
          infiniteScrollAction={handlePageChange}
          extraProps={{ refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} /> }}
        />
      )}

      <Select
        show={showSelect}
        onClose={() => setShowSelect(false)}
        onSave={() => setShowSelect(false)}
        selectedValue={deliveryTarget?.minutes?.toString() || ''}
        onValueChange={(value) => setDeliveryTarget({ orderID: deliveryTarget?.orderID || 0, minutes: Number(value.value) })}
        items={formattedDeliveryMinutes}
      />

      <Confirmation
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.title}
        description={confirmAction?.description}
        onConfirm={() => confirmAction?.onConfirm()}
        onCancel={() => setConfirmAction(null)}
      />
    </View>
  )
}

const OrderCard = ({ order, isUpdating, onAccept, onReject, onMarkDelivered }: {
  order: iOrder
  isUpdating?: boolean
  onAccept: () => void
  onReject: () => void
  onMarkDelivered: () => void
}) => {
  const router = useRouter()
  const { downloadInvoice, isDownloading } = useDownloadInvoice()
  const chip = orderStatusChip(order.status)
  const isNew = order.status === ORDER_STATUS.PLACED
  const inProgress = isInProgressOrderStatus(order.status)
  const delivered = order.status === ORDER_STATUS.DELIVERED
  const address = [order.address?.address_line1, order.address?.address_line2, order.address?.landmark, order.address?.city, order.address?.postal_code]
    .filter(Boolean).join(', ')

  return (
    <Card>
      <View className='bg-cardHeader flex-row items-center justify-between gap-x-[10px] px-[16px] py-[14px]'>
        <Pressable className='flex-row items-center gap-x-[8px] flex-1' onPress={() => router.push(`/orders/${order.id}`)}>
          <Box color={Colors.primaryTextColor} size={17} />
          <ThemedText size='subheading' className='font-bold'>{order.order_number}</ThemedText>
          <View className='h-[4px] w-[4px] rounded-full' style={{ backgroundColor: Colors.primaryTextColor }} />
          <ThemedText size='subheading' className='font-bold flex-1' numberOfLines={1}>{order.user_name}</ThemedText>
        </Pressable>
        {isNew ? null : <Chip label={chip.label} tone={chip.tone} />}
      </View>

      <CardRow first>
        <View className='gap-y-[12px]'>
          {order.items.map((item) => (
            <View key={item.id} className='flex-row justify-between items-center gap-x-[12px]'>
              <View className='flex-row items-center gap-x-[10px] flex-1'>
                <FontAwesome5 name='capsules' size={16} color={Colors.primaryTextColor} />
                <ThemedText size='subheading' numberOfLines={1} className='flex-1'>{item.medicine_name}</ThemedText>
              </View>
              <ThemedText size='subheading' className='font-semibold'>{itemQuantityLabel(item)}</ThemedText>
            </View>
          ))}
        </View>
      </CardRow>

      {isNew ? (
        <CardRow>
          <MetaLine icon='map-pin' text={address || 'No delivery address on file'} />
          <View className='mt-[12px]'>
            <MetaLine icon='phone' text={order.user_phone} />
          </View>
        </CardRow>
      ) : null}

      {inProgress ? (
        <CardRow>
          <View className='flex-row items-center gap-x-[16px]'>
            <FactPill icon='map-pin' text={order.rider_code ? `Rider : ${order.rider_code}` : 'Rider not assigned'} />
            <FactPill icon='clock' text={order.estimated_delivery_mins ? `ETA : ${order.estimated_delivery_mins}min` : 'ETA pending'} />
          </View>
        </CardRow>
      ) : null}

      {delivered ? (
        <CardRow>
          <View className='flex-row items-center gap-x-[16px]'>
            <FactPill icon='package' text={order.delivered_at ? `Delivered by ${timeLabel(order.delivered_at)}` : 'Delivered'} />
            <FactPill icon='clock' text={order.rider_code ? `Rider : ${order.rider_code}` : 'Rider —'} />
          </View>
        </CardRow>
      ) : null}

      {isNew ? (
        <CardRow>
          <View className='flex-row justify-between items-center'>
            <ThemedText size='heading' className='font-bold'>Total bill</ThemedText>
            <ThemedText size='heading' className='font-bold'>{getFormattedPrice(Number(order.total))}</ThemedText>
          </View>
          <View className='flex-row items-center gap-x-[12px] mt-[14px]'>
            <View className='flex-1'>
              <ActionButton title='Reject' tone='danger' loading={isUpdating} onPress={onReject} />
            </View>
            <View className='flex-1'>
              <ActionButton title='Accept' tone='primary' loading={isUpdating} onPress={onAccept} />
            </View>
          </View>
        </CardRow>
      ) : null}

      {inProgress ? (
        <CardRow>
          <View className='flex-row items-center gap-x-[12px]'>
            <View className='flex-1'>
              <ActionButton title='View Order' tone='neutral' onPress={() => router.push(`/orders/${order.id}`)} />
            </View>
            <View className='flex-1'>
              <ActionButton
                title='Mark Delivered'
                tone='success'
                loading={isUpdating}
                onPress={onMarkDelivered}
              />
            </View>
          </View>
        </CardRow>
      ) : null}

      {delivered ? (
        <CardRow>
          <View className='flex-row items-center justify-between gap-x-[12px]'>
            <View className='flex-1'>
              <View className='flex-row items-center gap-x-[8px]'>
                <ThemedText size='subheading' style={{ color: Colors.successAction }}>Paid</ThemedText>
                <View className='h-[4px] w-[4px] rounded-full' style={{ backgroundColor: Colors.successAction }} />
                <ThemedText size='subheading' style={{ color: Colors.successAction }}>
                  {order.payment_method === 'cod' ? 'Cash' : 'Prepaid'}
                </ThemedText>
              </View>
              <ThemedText size='subheading' className='font-bold mt-[4px]'>
                Total: {getFormattedPrice(Number(order.total))}
              </ThemedText>
            </View>
            <Pressable
              className='rounded-[10px] px-[16px] h-[46px] items-center justify-center'
              style={{ borderWidth: 1, borderColor: '#D9D9D9' }}
              disabled={isDownloading}
              onPress={() => downloadInvoice(order.id, order.order_number)}
            >
              {isDownloading
                ? <ActivityIndicator size='small' color={Colors.primary} />
                : <ThemedText size='subheading'>Download invoice</ThemedText>}
            </Pressable>
          </View>
        </CardRow>
      ) : null}
    </Card>
  )
}

const MetaLine = ({ icon, text }: { icon: React.ComponentProps<typeof Feather>['name']; text: string }) => (
  <View className='flex-row items-center gap-x-[10px]'>
    <IconPill size={30}><Feather name={icon} size={14} color={Colors.primary} /></IconPill>
    <ThemedText size='subheading' className='flex-1' numberOfLines={2}>{text}</ThemedText>
  </View>
)

const FactPill = ({ icon, text }: { icon: React.ComponentProps<typeof Feather>['name']; text: string }) => (
  <View className='flex-row items-center gap-x-[8px] flex-1'>
    <IconPill size={30}><Feather name={icon} size={14} color={Colors.primary} /></IconPill>
    <ThemedText size='small' className='flex-1' numberOfLines={1}>{text}</ThemedText>
  </View>
)
