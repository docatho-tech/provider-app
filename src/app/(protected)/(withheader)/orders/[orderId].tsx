import ThemedText from '@/components/common/ThemedText'
import Box from '@/components/icons/Box'
import { ScreenHeader } from '@/components/layout/Headers'
import { Card, CardRow, CardSection } from '@/components/ui/Card'
import { ActionButton, Avatar, Chip, CircleIcon, IconPill, StickyFooter } from '@/components/ui/Primitives'
import Confirmation from '@/components/common/Confirmation'
import Select from '@/components/general/Select'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import {
  ESTIMATED_DELIVERY_MINUTES,
  ORDER_STATUS,
  getOrderStatusLabel,
  isInProgressOrderStatus,
} from '@/constants/base'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import useCustomSafeAreaInsets from '@/hooks/useCustomSafeAreaInsets'
import useDownloadInvoice from '@/hooks/useDownloadInvoice'
import { iOrder, iOrderDetailsResponse } from '@/interfaces/order'
import { getFormattedPrice, replaceUrlParams } from '@/utils/base'
import { itemQuantityLabel, orderStatusHeaderChip } from '@/utils/orderUi'
import { dayLabel, timeLabel } from '@/utils/schedule'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'

const STATUS_TOAST: Record<string, string> = {
  [ORDER_STATUS.APPROVED]: 'Order accepted',
  [ORDER_STATUS.REJECTED]: 'Order rejected',
  [ORDER_STATUS.PACKED]: 'Order marked as packed',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Order out for delivery',
  [ORDER_STATUS.DELIVERED]: 'Order marked as delivered',
}

/** The fulfilment step a status moves on to, and what the button for it says. */
const NEXT_STEP: Record<string, { status: string; label: string }> = {
  [ORDER_STATUS.APPROVED]: { status: ORDER_STATUS.PACKED, label: 'Mark as packed' },
  [ORDER_STATUS.PACKED]: { status: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'Out for delivery' },
}

/**
 * One order, in whichever of its three states it is in.
 *
 * A new order's items carry checkboxes: accepting is a claim that the pharmacy
 * has all of them, and ticking them off is how that claim gets made. Once the
 * order is accepted the ticks are gone — they were a packing aid, not a record.
 */
const OrderDetail = () => {
  const router = useRouter()
  const { bottom } = useCustomSafeAreaInsets()
  const { orderId } = useLocalSearchParams<{ orderId: string }>()
  const [showSelect, setShowSelect] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ title: string; description: string; onConfirm: () => void } | null>(null)
  const [deliveryMinutes, setDeliveryMinutes] = useState<number | null>(null)
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [updating, setUpdating] = useState(false)

  const { requestGET: getOrderDetails, response: order } = useAxios<iOrderDetailsResponse>(
    replaceUrlParams(API_ENDPOINTS.ORDER_DETAILS, { orderId }), true,
  )
  const { requestPATCH: updateOrderStatus } = useAxios<iOrder>(API_ENDPOINTS.UPDATE_ORDER_STATUS, true)
  const { downloadInvoice, isDownloading } = useDownloadInvoice()

  useEffect(() => { getOrderDetails() }, [orderId])

  // Every line starts ticked: the pharmacy is confirming a full order and
  // unticking what it cannot supply, which is the rarer half of the job.
  useEffect(() => {
    if (!order) return
    setChecked(Object.fromEntries(order.items.map((item) => [item.id, true])))
  }, [order?.id])

  useEffect(() => {
    if (deliveryMinutes) handleUpdateStatus(ORDER_STATUS.DELIVERED)
  }, [deliveryMinutes])

  const deliveryOptions = useMemo(() => (
    Object.values(ESTIMATED_DELIVERY_MINUTES).map((item) => ({ label: item.label, value: item.value.toString() }))
  ), [])

  const handleUpdateStatus = async (status: string) => {
    setShowSelect(false)
    setConfirmAction(null)
    setUpdating(true)

    const body: Record<string, unknown> = { status }
    if (status === ORDER_STATUS.DELIVERED && deliveryMinutes) body.estimated_delivery_mins = deliveryMinutes

    const localURL = replaceUrlParams(API_ENDPOINTS.UPDATE_ORDER_STATUS, { orderId })
    const response = await updateOrderStatus(body, localURL)
    setUpdating(false)
    if (response.status === 200) {
      setDeliveryMinutes(null)
      Toast.show({ text1: STATUS_TOAST[status] || 'Order updated', type: 'success' })
      getOrderDetails()
    }
  }

  const confirm = (title: string, description: string, status: string) => setConfirmAction({
    title,
    description,
    onConfirm: () => handleUpdateStatus(status),
  })

  if (!order) {
    return (
      <View className='flex-1 bg-page'>
        <ScreenHeader title='Order' backButtonRoute='/' />
        <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
      </View>
    )
  }

  const chip = orderStatusHeaderChip(order.status)
  const isNew = order.status === ORDER_STATUS.PLACED
  const inTransit = order.status === ORDER_STATUS.OUT_FOR_DELIVERY
  const delivered = order.status === ORDER_STATUS.DELIVERED
  const nextStep = NEXT_STEP[order.status]
  const address = [order.address?.address_line1, order.address?.address_line2, order.address?.landmark, order.address?.city, order.address?.postal_code]
    .filter(Boolean).join(', ')

  const call = () => order.user_phone && Linking.openURL(`tel:${order.user_phone}`)
  const navigate = () => address && Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`)

  return (
    <View className='flex-1 bg-page'>
      <ScreenHeader
        title={order.order_number}
        backButtonRoute='/'
        right={<Chip label={chip.label} tone={chip.tone} />}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}>
        <Card>
          <CardSection icon={<Box color={Colors.primaryTextColor} size={16} />} title='Order details' />
          {order.items.map((item, index) => (
            <CardRow key={item.id} first={index === 0}>
              <View className='flex-row items-center gap-x-[12px]'>
                {isNew ? (
                  <Checkbox
                    value={checked[item.id] ?? true}
                    onToggle={() => setChecked((current) => ({ ...current, [item.id]: !(current[item.id] ?? true) }))}
                  />
                ) : null}
                <FontAwesome5 name='capsules' size={16} color={Colors.primaryTextColor} />
                <ThemedText size='subheading' className='flex-1' numberOfLines={1}>{item.medicine_name}</ThemedText>
                <ThemedText size='subheading' className='font-semibold'>{itemQuantityLabel(item)}</ThemedText>
              </View>
            </CardRow>
          ))}
          <CardRow>
            <View className='flex-row items-center justify-between'>
              <ThemedText size='subheading' className='font-bold'>Total</ThemedText>
              <ThemedText size='subheading' className='font-bold'>{getFormattedPrice(Number(order.total))}</ThemedText>
            </View>
          </CardRow>
        </Card>

        <Card>
          <CardSection icon={<Feather name='user' size={15} color={Colors.primaryTextColor} />} title='Customer details' />
          <CardRow first>
            <View className='flex-row items-center gap-x-[12px]'>
              <Avatar name={order.user_name} size={44} />
              <ThemedText size='subheading' className='font-semibold flex-1' numberOfLines={1}>{order.user_name}</ThemedText>
              <View className='items-end'>
                <ThemedText size='small' className='font-semibold'>{dayLabel(order.placed_at)}</ThemedText>
                <ThemedText size='small' className='mt-[3px]' style={{ color: Colors.mutedTextColor }}>
                  {timeLabel(order.placed_at)}
                </ThemedText>
              </View>
            </View>
          </CardRow>
          <CardRow>
            <ContactLine
              label='Delivery address'
              value={address || 'No address on file'}
              icon={<Feather name='navigation' size={16} color={Colors.primary} />}
              leading={<Feather name='map-pin' size={15} color={Colors.primaryTextColor} />}
              onPress={address ? navigate : undefined}
            />
          </CardRow>
          <CardRow>
            <ContactLine
              value={order.user_phone || 'No phone on file'}
              icon={<Feather name='phone' size={16} color={Colors.primary} />}
              leading={<Feather name='phone' size={15} color={Colors.primaryTextColor} />}
              onPress={order.user_phone ? call : undefined}
            />
          </CardRow>
        </Card>

        {inTransit ? (
          <Card>
            <CardSection icon={<Feather name='truck' size={15} color={Colors.primaryTextColor} />} title='Rider details' />
            <CardRow first>
              <View className='flex-row items-center gap-x-[12px]'>
                <Avatar name={order.rider_name || 'Rider'} size={42} />
                <View className='flex-1'>
                  <ThemedText size='subheading' className='font-semibold'>{order.rider_name || 'Not assigned yet'}</ThemedText>
                  {order.rider_code ? (
                    <ThemedText size='small' className='mt-[3px]' style={{ color: Colors.mutedTextColor }}>{order.rider_code}</ThemedText>
                  ) : null}
                </View>
                {order.estimated_delivery_mins ? (
                  <Chip tone='primarySoft' label={`ETA ${order.estimated_delivery_mins}min`} />
                ) : null}
              </View>
            </CardRow>
          </Card>
        ) : (
          <Card>
            <CardSection icon={<Feather name='calendar' size={15} color={Colors.primaryTextColor} />} title='Order status' />
            <CardRow first>
              <View className='flex-row items-center gap-x-[12px]'>
                <IconPill><Feather name='package' size={17} color={Colors.primary} /></IconPill>
                <View className='flex-1'>
                  <ThemedText size='subheading' className='font-semibold'>{getOrderStatusLabel(order.status)}</ThemedText>
                  <ThemedText size='small' className='mt-[3px]' style={{ color: Colors.mutedTextColor }}>
                    {delivered && order.delivered_at
                      ? `Delivered ${dayLabel(order.delivered_at)} at ${timeLabel(order.delivered_at)}`
                      : `Placed ${dayLabel(order.placed_at)} at ${timeLabel(order.placed_at)}`}
                  </ThemedText>
                </View>
              </View>
            </CardRow>
            {order.estimated_delivery_start && order.estimated_delivery_end ? (
              <CardRow>
                <View className='flex-row items-center gap-x-[12px]'>
                  <IconPill><Feather name='clock' size={17} color={Colors.primary} /></IconPill>
                  <View className='flex-1'>
                    <ThemedText size='subheading' className='font-semibold'>Estimated delivery</ThemedText>
                    <ThemedText size='small' className='mt-[3px]' style={{ color: Colors.mutedTextColor }}>
                      {order.estimated_delivery_start} - {order.estimated_delivery_end}
                    </ThemedText>
                  </View>
                </View>
              </CardRow>
            ) : null}
          </Card>
        )}
      </ScrollView>

      <StickyFooter bottomInset={bottom}>
        {isNew ? (
          <>
            <View className='flex-1'>
              <ActionButton
                title='Reject'
                tone='danger'
                loading={updating}
                onPress={() => confirm('Reject order?', 'The customer will be notified.', ORDER_STATUS.REJECTED)}
              />
            </View>
            <View className='flex-1'>
              <ActionButton
                title='Accept'
                tone='primary'
                loading={updating}
                onPress={() => confirm('Accept order?', 'You will start processing this order.', ORDER_STATUS.APPROVED)}
              />
            </View>
          </>
        ) : inTransit ? (
          <>
            <View className='flex-1'>
              <ActionButton
                title='Reject'
                tone='neutral'
                loading={updating}
                onPress={() => confirm('Reject order?', 'The customer will be notified.', ORDER_STATUS.REJECTED)}
              />
            </View>
            <View className='flex-1'>
              <ActionButton title='Mark as delivered' tone='primary' loading={updating} onPress={() => setShowSelect(true)} />
            </View>
          </>
        ) : delivered ? (
          <>
            <View className='flex-1'>
              <ActionButton
                title='Raise a concern'
                tone='neutral'
                onPress={() => router.push('/profile')}
              />
            </View>
            <View className='flex-1'>
              <ActionButton
                title='Download invoice'
                tone='primary'
                icon={<Feather name='file-text' size={16} color='#FFFFFF' />}
                loading={isDownloading}
                onPress={() => downloadInvoice(orderId, order.order_number)}
              />
            </View>
          </>
        ) : nextStep ? (
          <View className='flex-1'>
            <ActionButton
              title={nextStep.label}
              tone='primary'
              loading={updating}
              onPress={() => handleUpdateStatus(nextStep.status)}
            />
          </View>
        ) : (
          <View className='flex-1'>
            <ActionButton title={getOrderStatusLabel(order.status)} tone='disabled' />
          </View>
        )}
      </StickyFooter>

      <Select
        show={showSelect}
        onClose={() => setShowSelect(false)}
        onSave={() => setShowSelect(false)}
        selectedValue={deliveryMinutes?.toString() || ''}
        onValueChange={(value) => setDeliveryMinutes(Number(value.value))}
        items={deliveryOptions}
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

const Checkbox = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
  <Pressable
    onPress={onToggle}
    hitSlop={8}
    className='w-[22px] h-[22px] rounded-[6px] items-center justify-center'
    style={{
      backgroundColor: value ? Colors.primary : '#FFFFFF',
      borderWidth: value ? 0 : 1.5,
      borderColor: '#C9C9C9',
    }}
  >
    {value ? <Feather name='check' size={15} color='#FFFFFF' /> : null}
  </Pressable>
)

const ContactLine = ({ label, value, icon, leading, onPress }: {
  label?: string
  value: string
  icon: React.ReactNode
  leading: React.ReactNode
  onPress?: () => void
}) => (
  <View className='flex-row items-center justify-between gap-x-[12px]'>
    <View className='flex-row items-start gap-x-[10px] flex-1'>
      <View className='pt-[2px]'>{leading}</View>
      <View className='flex-1'>
        {label ? <ThemedText size='subheading' className='font-semibold'>{label}</ThemedText> : null}
        <ThemedText size='subheading' className={label ? 'mt-[3px]' : ''} style={label ? { color: Colors.secondaryTextColor } : undefined}>
          {value}
        </ThemedText>
      </View>
    </View>
    <Pressable onPress={onPress} disabled={!onPress} style={!onPress ? { opacity: 0.4 } : undefined}>
      <CircleIcon size={42}>{icon}</CircleIcon>
    </Pressable>
  </View>
)

export default OrderDetail
