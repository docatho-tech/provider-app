import Chips from '@/components/common/Chips';
import Confirmation from '@/components/common/Confirmation';
import Separator from '@/components/common/Separator';
import ThemedText from '@/components/common/ThemedText';
import Select from '@/components/general/Select';
import Box from '@/components/icons/Box';
import Location from '@/components/icons/Location';
import { HeaderLeftStandard } from '@/components/layout/Headers';
import { API_ENDPOINTS } from '@/constants/APIEndpoints';
import {
  ESTIMATED_DELIVERY_MINUTES,
  ORDER_STATUS,
  getOrderStatusLabel,
  isTerminalOrderStatus,
} from '@/constants/base';
import { Colors } from '@/constants/Colors';
import useAxios from '@/hooks/useAxios';
import useCustomSafeAreaInsets from '@/hooks/useCustomSafeAreaInsets';
import useDownloadInvoice from '@/hooks/useDownloadInvoice';
import { iOrder, iOrderDetailsResponse } from '@/interfaces/order';
import { getFormattedPrice, replaceUrlParams } from '@/utils/base';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import Toast from 'react-native-toast-message';

const STATUS_TOAST: Record<string, string> = {
  [ORDER_STATUS.APPROVED]: 'Order accepted',
  [ORDER_STATUS.REJECTED]: 'Order rejected',
  [ORDER_STATUS.PACKED]: 'Order marked as packed',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Order out for delivery',
  [ORDER_STATUS.DELIVERED]: 'Order marked as delivered',
};

const OrderSuccess = () => {
  const { bottom, top } = useCustomSafeAreaInsets();
  const navigation = useNavigation();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [showSelect, setShowSelect] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [selectedEstimatedDeliveryMinutes, setSelectedEstimatedDeliveryMinutes] = useState<number | null>(null);
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});
  const { requestGET: getOrderDetails, response: orderDetailsResponse } = useAxios<iOrderDetailsResponse>(replaceUrlParams(API_ENDPOINTS.ORDER_DETAILS, { orderId: orderId }), true);
  const { requestPATCH: updateOrderStatus } = useAxios<iOrder>(API_ENDPOINTS.UPDATE_ORDER_STATUS, true);
  const { downloadInvoice, isDownloading } = useDownloadInvoice();

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <View className='flex-row bg-white items-center justify-between px-[5%] pb-[10px]' style={{ paddingTop: top }}>
          <HeaderLeftStandard routeName={'Order Details'} />
          <Chips text={getOrderStatusLabel(orderDetailsResponse?.status || ORDER_STATUS.DELIVERED)} color={getStatusColor(orderDetailsResponse?.status || '').color} backgroundColor={getStatusColor(orderDetailsResponse?.status || '').backgroundColor} />
        </View>
      )
    });
  }, [orderDetailsResponse]);

  useEffect(() => {
    getOrderDetails();
  }, [orderId]);

  useEffect(() => {
    if (selectedEstimatedDeliveryMinutes) {
      handleUpdateOrderStatus(ORDER_STATUS.DELIVERED);
    }
  }, [selectedEstimatedDeliveryMinutes]);

  const getStatusColor = (status: string) => {
    if (status === ORDER_STATUS.DELIVERED) {
      return { color: '#2B6436', backgroundColor: '#D0EBD7' }
    }
    if (status === ORDER_STATUS.REJECTED || status === ORDER_STATUS.CANCELLED) {
      return { color: '#FF0000', backgroundColor: '#FFE5E5' }
    }
    return { color: '#313131', backgroundColor: 'rgba(49, 49, 49, 0.1)' }
  }

  const formattedEstimatedDeliveryMinutes = useMemo(() => {
    return Object.values(ESTIMATED_DELIVERY_MINUTES).map((item) => ({
      label: item.label,
      value: item.value.toString(),
    }));
  }, []);

  const handleUpdateOrderStatus = async (status: string) => {
    setShowSelect(false);
    setShowConfirmation(false);

    const body: Record<string, unknown> = { status };
    if (status === ORDER_STATUS.DELIVERED && selectedEstimatedDeliveryMinutes) {
      body.estimated_delivery_mins = selectedEstimatedDeliveryMinutes;
    }

    const localURL = replaceUrlParams(API_ENDPOINTS.UPDATE_ORDER_STATUS, { orderId: orderId });
    const response = await updateOrderStatus(body, localURL);
    if (response.status === 200) {
      setSelectedEstimatedDeliveryMinutes(null);
      setOnConfirmAction(() => {});
      Toast.show({
        text1: STATUS_TOAST[status] || 'Order updated',
        type: 'success',
      });

      getOrderDetails();
    }
  }

  if (!orderDetailsResponse) return null;

  const orderStatus = orderDetailsResponse.status;

  return (
    <View className='flex-1'>
      <ScrollView className='flex-1 px-[5%]' showsVerticalScrollIndicator={false}>
        <View style={{ paddingBottom: bottom }}>
          <View className='items-start justify-start mt-[20px]'>
            <ThemedText size='subheading' className='font-semibold mt-[5px]'>ID: {orderDetailsResponse?.order_number}</ThemedText>
          </View>

          <View className='bg-white rounded-[10px] p-[10px] mt-[10px]'>
            <View className='flex-row items-center gap-[10px]'>
              <Feather name="truck" size={18} color={Colors.primaryTextColor} />
              <ThemedText>Shipping Details</ThemedText>
            </View>

            <View className='my-[10px]'>
              <Separator />
            </View>

            {
              orderDetailsResponse?.estimated_delivery_start && orderDetailsResponse?.estimated_delivery_end &&
              <View className='flex-row items-center gap-[10px]'>
                <View className='justify-center bg-primary/10 rounded-full w-[35px] h-[35px] items-center'>
                  <Feather name="calendar" size={18} color={Colors.primary} />
                </View>

                <View className='w-[80%]'>
                  <ThemedText>Estimated Delivery</ThemedText>
                  <ThemedText className='text-secondaryTextColor mt-[5px] !text-[12px]'>{orderDetailsResponse?.estimated_delivery_start} - {orderDetailsResponse?.estimated_delivery_end}</ThemedText>
                </View>
              </View>
            }

            {
              orderDetailsResponse?.estimated_delivery_start && orderDetailsResponse?.estimated_delivery_end &&
              <View className='my-[10px]'>
                <Separator />
              </View>
            }

            <View className='flex-row items-center gap-[10px]'>
              <View className='justify-center bg-primary/10 rounded-full w-[35px] h-[35px] items-center'>
                <Location size={18} color={Colors.primary} />
              </View>

              <View className='w-[80%]'>
                <ThemedText>Delivery Address</ThemedText>
                <ThemedText className='text-secondaryTextColor mt-[5px] !text-[12px]'> {orderDetailsResponse?.address?.address_line1} {orderDetailsResponse?.address?.address_line2} {orderDetailsResponse?.address?.landmark} {orderDetailsResponse?.address?.city} {orderDetailsResponse?.address?.state} {orderDetailsResponse?.address?.postal_code} </ThemedText>
              </View>
            </View>
          </View>

          <OrderDetails data={orderDetailsResponse as iOrderDetailsResponse} />

          <View className='bg-white rounded-[10px] p-[10px] mt-[10px]'>
            <View className='flex-row items-center gap-[10px]'>
              <AntDesign name="user" size={16} color={Colors.primaryTextColor} />
              <ThemedText>User Details</ThemedText>
            </View>
            <View className='flex-row items-center gap-[10px] mt-[10px]'>
              <View className='justify-center bg-primary/10 rounded-full w-[35px] h-[35px] items-center'>
                <AntDesign name="user" size={16} color={Colors.primary} />
              </View>
              <ThemedText>{orderDetailsResponse?.user_name || 'N/A'}</ThemedText>
            </View>
            <View className='flex-row items-center gap-[10px] mt-[10px]'>
              <View className='justify-center bg-primary/10 rounded-full w-[35px] h-[35px] items-center'>
                <Feather name="phone" size={16} color={Colors.primary} />
              </View>
              <ThemedText>{orderDetailsResponse?.user_phone || 'N/A'}</ThemedText>
            </View>
          </View>

          <View className='bg-white rounded-[10px] p-[10px] mt-[10px]'>
            <View className='flex-row items-center gap-[10px]'>
              <AntDesign name="creditcard" size={16} color={Colors.primaryTextColor} />
              <ThemedText>Payment Method</ThemedText>
            </View>
            <View className='flex-row items-center gap-[10px] mt-[10px]'>
              <View className='justify-center bg-primary/10 rounded-full w-[35px] h-[35px] items-center'>
                <AntDesign name="creditcard" size={16} color={Colors.primary} />
              </View>
              <ThemedText> Online </ThemedText>
            </View>
          </View>
        </View>

      </ScrollView>

      {
        orderStatus && !isTerminalOrderStatus(orderStatus) &&
        <View className='flex-row items-center gap-[10px] px-[5%]' style={{ paddingBottom: bottom }}>
          {orderStatus === ORDER_STATUS.PLACED && (
            <>
              <Pressable
                className='border border-[#FF0000] rounded-[10px] p-[15px] items-center justify-center w-[50%]'
                onPress={() => {
                  setShowConfirmation(true);
                  setOnConfirmAction(() => () => handleUpdateOrderStatus(ORDER_STATUS.REJECTED));
                }}
              >
                <ThemedText className='text-[#FF0000]'>Reject</ThemedText>
              </Pressable>
              <Pressable
                className='bg-primary rounded-[10px] p-[15px] items-center justify-center w-[50%]'
                onPress={() => {
                  setShowConfirmation(true);
                  setOnConfirmAction(() => () => handleUpdateOrderStatus(ORDER_STATUS.APPROVED));
                }}
              >
                <ThemedText className='text-white'>Accept</ThemedText>
              </Pressable>
            </>
          )}
          {orderStatus === ORDER_STATUS.APPROVED && (
            <Pressable
              className='bg-primary rounded-[10px] p-[15px] items-center justify-center w-full'
              onPress={() => {
                setShowConfirmation(true);
                setOnConfirmAction(() => () => handleUpdateOrderStatus(ORDER_STATUS.PACKED));
              }}
            >
              <ThemedText className='text-white'>Mark as Packed</ThemedText>
            </Pressable>
          )}
          {orderStatus === ORDER_STATUS.PACKED && (
            <Pressable
              className='bg-primary rounded-[10px] p-[15px] items-center justify-center w-full'
              onPress={() => {
                setShowConfirmation(true);
                setOnConfirmAction(() => () => handleUpdateOrderStatus(ORDER_STATUS.OUT_FOR_DELIVERY));
              }}
            >
              <ThemedText className='text-white'>Out for Delivery</ThemedText>
            </Pressable>
          )}
          {orderStatus === ORDER_STATUS.OUT_FOR_DELIVERY && (
            <Pressable className='bg-primary rounded-[10px] p-[15px] items-center justify-center w-full' onPress={() => setShowSelect(true)}>
              <ThemedText className='text-white'>Mark as Delivered</ThemedText>
            </Pressable>
          )}
        </View>
      }

      {
        orderStatus === ORDER_STATUS.DELIVERED &&
        <View className='px-[5%]' style={{ paddingBottom: bottom }}>
          <Pressable
            className='border border-primary rounded-[10px] p-[15px] items-center justify-center'
            disabled={isDownloading}
            onPress={() => downloadInvoice(orderId, orderDetailsResponse?.order_number)}
          >
            {
              isDownloading
                ? <ActivityIndicator size='small' color={Colors.primary} />
                : <ThemedText className='text-primary'>Download Invoice</ThemedText>
            }
          </Pressable>
        </View>
      }

      <Select
        show={showSelect}
        onClose={() => setShowSelect(false)}
        onSave={() => setShowSelect(false)}
        selectedValue={selectedEstimatedDeliveryMinutes?.toString() || ''}
        onValueChange={(value) => setSelectedEstimatedDeliveryMinutes(Number(value.value))}
        items={formattedEstimatedDeliveryMinutes}
      />

      <Confirmation
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={onConfirmAction}
        onCancel={() => setShowConfirmation(false)}
      />
    </View>
  )
}

export default OrderSuccess

const OrderDetails = ({ data }: { data: iOrderDetailsResponse }) => {

  if (!data) return null;
  return (
    <View className='bg-white rounded-[10px] p-[10px] mt-[10px]'>
      <View className='flex-row items-center gap-[5px]'>
        <Box color={Colors.primaryTextColor} size={15} />
        <ThemedText className='text-primaryTextColor'> Order Details </ThemedText>
      </View>

      <View className='my-[10px]'>
        <Separator />
      </View>

      {
        data.items.map((item, index) => (
          <View key={index} className='mt-[5px] flex-row items-center justify-between'>
            <View>
              <ThemedText className='mt-[10px]'> {item.medicine_name} </ThemedText>
              <ThemedText className='mt-[5px] text-secondaryTextColor !text-[12px]'> Qty: {item.quantity} </ThemedText>
            </View>
            <ThemedText className='mt-[10px] font-semibold'> {getFormattedPrice(Number(item.line_total))} </ThemedText>
          </View>
        ))
      }
      <View className='mt-[5px] flex-row items-center justify-between'>
        <View>
          <ThemedText className='mt-[10px] !text-[12px]'> Subtotal </ThemedText>
        </View>
        <ThemedText className='mt-[10px] font-semibold'> {getFormattedPrice(Number(data.subtotal))} </ThemedText>
      </View>
      <View className='mt-[5px] flex-row items-center justify-between'>
        <View>
          <ThemedText className='mt-[10px] !text-[12px]'> Delivery Fee </ThemedText>
        </View>
        <ThemedText className='mt-[10px] font-semibold'> {getFormattedPrice(Number(data.delivery_fee))} </ThemedText>
      </View>

      <View className='my-[10px]'>
        <Separator />
      </View>

      <View className='mt-[5px] flex-row items-center justify-between'>
        <View>
          <ThemedText className='font-semibold'> Total Paid </ThemedText>
        </View>
        <ThemedText className='font-semibold'> {getFormattedPrice(Number(data.total))} </ThemedText>
      </View>
    </View>
  )
}
