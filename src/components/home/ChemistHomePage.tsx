import { API_ENDPOINTS } from "@/constants/APIEndpoints";
import {
  ESTIMATED_DELIVERY_MINUTES,
  ORDER_STATUS,
  getOrderStatusLabel,
  isInProgressOrderStatus,
} from "@/constants/base";
import { Colors } from "@/constants/Colors";
import useAxios from "@/hooks/useAxios";
import useDownloadInvoice from "@/hooks/useDownloadInvoice";
import { iOrder, iOrderListResponse } from "@/interfaces/order";
import { getFormattedPrice, getNextPageNumberFromURL, replaceUrlParams } from "@/utils/base";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, View } from "react-native";
import Toast from "react-native-toast-message";
import Chips from "../common/Chips";
import Confirmation from "../common/Confirmation";
import Separator from "../common/Separator";
import Tabs from "../common/Tabs";
import ThemedText from "../common/ThemedText";
import CustomFlatList from "../general/CustomFlatList";
import Select from "../general/Select";
import Box from "../icons/Box";
import Call from "../icons/Call";
import Location from "../icons/Location";
import SearchBar from "../common/SearchBar";

export const TAB_ITEMS = Object.freeze({
  new: { label: "New", value: ORDER_STATUS.PLACED },
  inProgress: { label: "In Progress", value: "in_progress" },
  completed: { label: "Completed", value: ORDER_STATUS.DELIVERED },
});

export default function ChemistHomePage() {
  const { requestGET: getOrderList, response: orderListResponse, isLoading, error } = useAxios<iOrderListResponse>(API_ENDPOINTS.ORDER_LIST, true);
  const { requestPATCH: updateOrderStatus } = useAxios<iOrder>(API_ENDPOINTS.UPDATE_ORDER_STATUS, true);

  const [selectedStatus, setSelectedStatus] = useState<string>(TAB_ITEMS.new.value);
  const [selectedEstimatedDeliveryMinutes, setSelectedEstimatedDeliveryMinutes] = useState<{ orderID: number, estimatedDeliveryMinutes: number | null } | null>(null);
  const [showSelect, setShowSelect] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionOrderId, setActionOrderId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ title: string; description: string; onConfirm: () => void } | null>(null);

  const buildParams = useCallback((page: number) => {
    const params: Record<string, unknown> = { page, page_size: 10 };
    if (selectedStatus === TAB_ITEMS.new.value) params.status = ORDER_STATUS.PLACED;
    else if (selectedStatus === TAB_ITEMS.completed.value) params.status = ORDER_STATUS.DELIVERED;
    return params;
  }, [selectedStatus]);

  const loadOrders = useCallback((page = 1) => getOrderList(buildParams(page)), [buildParams, getOrderList]);

  useEffect(() => { loadOrders(1); }, [selectedStatus]);

  const displayedOrders = useMemo(() => {
    const results = orderListResponse?.results || [];
    if (selectedStatus === TAB_ITEMS.inProgress.value) {
      return results.filter((order) => isInProgressOrderStatus(order.status));
    }
    return results;
  }, [orderListResponse, selectedStatus]);

  useEffect(() => {
    if (selectedEstimatedDeliveryMinutes?.estimatedDeliveryMinutes) {
      handleMarkAsDelivered(selectedEstimatedDeliveryMinutes.orderID, selectedEstimatedDeliveryMinutes.estimatedDeliveryMinutes);
    }
  }, [selectedEstimatedDeliveryMinutes]);

  const formattedEstimatedDeliveryMinutes = useMemo(() => (
    Object.values(ESTIMATED_DELIVERY_MINUTES).map((item) => ({ label: item.label, value: item.value.toString() }))
  ), []);

  const handlePageChange = () => {
    if (orderListResponse?.next) {
      const nextPageNumber = getNextPageNumberFromURL(orderListResponse.next);
      if (nextPageNumber) loadOrders(nextPageNumber);
      return nextPageNumber;
    }
    return null;
  };

  const handleStatusUpdate = async (orderId: number, status: string, successMessage: string) => {
    setActionOrderId(orderId);
    const localURL = replaceUrlParams(API_ENDPOINTS.UPDATE_ORDER_STATUS, { orderId });
    const response = await updateOrderStatus({ status }, localURL);
    setActionOrderId(null);
    if (response.status === 200) {
      Toast.show({ text1: successMessage, type: 'success' });
      loadOrders(1);
    }
  };

  const handleMarkAsDelivered = async (orderId: number, estimatedDeliveryMinutes: number) => {
    setShowSelect(false);
    setActionOrderId(orderId);
    const localURL = replaceUrlParams(API_ENDPOINTS.UPDATE_ORDER_STATUS, { orderId });
    const response = await updateOrderStatus({ status: ORDER_STATUS.DELIVERED, estimated_delivery_mins: estimatedDeliveryMinutes }, localURL);
    setActionOrderId(null);
    if (response.status === 200) {
      setSelectedEstimatedDeliveryMinutes(null);
      Toast.show({ text1: 'Order marked as delivered', type: 'success' });
      loadOrders(1);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders(1);
    setRefreshing(false);
  };

  return (
    <View className="flex-1 px-[5%]">
      <View className="mt-[20px]">
        <Header selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} />
        <View className="mt-[12px]"><SearchBar /></View>
      </View>

      {isLoading && !orderListResponse ? (
        <ActivityIndicator className="mt-[40px]" color={Colors.primary} />
      ) : (
        <CustomFlatList
          data={displayedOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <OrderItem
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
              onMarkAsDeliveredClick={() => {
                setSelectedEstimatedDeliveryMinutes({ orderID: item.id, estimatedDeliveryMinutes: null });
                setShowSelect(true);
              }}
            />
          )}
          gap={10}
          ListHeaderComponent={<View className="mt-[10px]" />}
          ListFooterComponent={<View className="mb-[10px]" />}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-[40px]">
              <ThemedText className="text-secondaryTextColor text-center">
                {error ? 'Could not load orders. Pull to refresh.' : 'No orders found'}
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
        selectedValue={selectedEstimatedDeliveryMinutes?.estimatedDeliveryMinutes?.toString() || ''}
        onValueChange={(value) => setSelectedEstimatedDeliveryMinutes({ orderID: selectedEstimatedDeliveryMinutes?.orderID || 0, estimatedDeliveryMinutes: Number(value.value) })}
        items={formattedEstimatedDeliveryMinutes}
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
  );
}

const Header = ({ selectedStatus, setSelectedStatus }: { selectedStatus: string, setSelectedStatus: (status: string) => void }) => (
  <Tabs
    tabs={Object.values(TAB_ITEMS).map((status) => ({ title: status.label, value: status.value }))}
    activeTab={selectedStatus}
    setActiveTab={(tab) => setSelectedStatus(tab)}
  />
);

const OrderItem = ({ order, isUpdating, onAccept, onReject, onMarkAsDeliveredClick }: {
  order: iOrder;
  isUpdating?: boolean;
  onAccept: () => void;
  onReject: () => void;
  onMarkAsDeliveredClick: () => void;
}) => {
  const router = useRouter();
  const { downloadInvoice, isDownloading } = useDownloadInvoice();

  return (
    <View className="bg-white rounded-[16px] border-primary/10 border">
      <View className="bg-[#F7F7F7] rounded-t-[16px] flex-row items-center gap-x-[10px] px-[15px] pt-[15px] pb-[15px] justify-between">
        <View className={`flex-row items-center gap-x-[10px] flex-wrap ${order.status === ORDER_STATUS.PLACED ? 'w-[100%]' : 'w-[75%]'}`}>
          <Box color={Colors.primary} size={20} />
          <Pressable onPress={() => router.push(`/orders/${order.id}`)}>
            <ThemedText size="subheading" className="font-semibold underline">{order.order_number}</ThemedText>
          </Pressable>
          <View className="h-[5px] w-[5px] bg-primaryText rounded-full" />
          <ThemedText className="font-semibold">{order.user_name}</ThemedText>
        </View>
        {order.status !== ORDER_STATUS.PLACED && (
          <Chips text={getOrderStatusLabel(order.status)} color={order.status === ORDER_STATUS.DELIVERED ? '#2B6436' : 'white'} backgroundColor={order.status === ORDER_STATUS.DELIVERED ? '#D0EBD7' : "#313131CC"} />
        )}
      </View>

      <View className="px-[15px] pb-[15px] pt-[10px]">
        <View className="gap-y-[10px]">
          {order.items.map((item) => (
            <View key={item.id} className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-x-[10px] w-[80%]">
                <FontAwesome5 name="capsules" size={18} color={Colors.primaryTextColor} />
                <ThemedText numberOfLines={1} className="font-semibold">{item.medicine_name}</ThemedText>
              </View>
              <ThemedText className="font-semibold">{item.quantity} Units</ThemedText>
            </View>
          ))}
        </View>

        <View className="my-[10px]"><Separator /></View>

        {order.status === ORDER_STATUS.PLACED && (
          <>
            <View className="flex-row items-center gap-x-[10px] mb-[10px]">
              <View className="bg-primary/10 rounded-full p-[5px] w-[30px] h-[30px] items-center justify-center">
                <Location color={Colors.primary} size={16} />
              </View>
              <ThemedText numberOfLines={3} className="w-[90%]">
                {order.address?.address_line1} {order.address?.address_line2} {order.address?.landmark} {order.address?.city} {order.address?.state} {order.address?.postal_code}
              </ThemedText>
            </View>
            <View className="flex-row items-center gap-x-[10px]">
              <View className="bg-primary/10 rounded-full p-[5px] w-[30px] h-[30px] items-center justify-center">
                <Call color={Colors.primary} size={16} />
              </View>
              <ThemedText numberOfLines={3} className="w-[90%]">{order.user_phone}</ThemedText>
            </View>
          </>
        )}

        {isInProgressOrderStatus(order.status) && (
          <View className="flex-row items-center gap-x-[10px]">
            <View className="bg-primary/10 rounded-full p-[5px] w-[30px] h-[30px] items-center justify-center">
              <Location color={Colors.primary} size={16} />
            </View>
            <ThemedText numberOfLines={3} className="w-[90%]">
              {order.estimated_delivery_mins ? `ETA: ${order.estimated_delivery_mins} minutes` : getOrderStatusLabel(order.status)}
            </ThemedText>
          </View>
        )}

        {order.status !== ORDER_STATUS.DELIVERED && <View className="my-[20px]"><Separator /></View>}

        {order.status === ORDER_STATUS.PLACED && (
          <>
            <View className="flex-row justify-between items-center mb-[14px]">
              <ThemedText className="font-semibold" size="heading">Total bill</ThemedText>
              <ThemedText className="font-semibold" size="heading">{getFormattedPrice(Number(order.total))}</ThemedText>
            </View>
            <View className="flex-row items-center gap-x-[10px] justify-end">
              {isUpdating ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Pressable className="rounded-[12px] p-[10px] border border-red-300" onPress={onReject}>
                    <ThemedText className="text-red-500 text-[16px]">Reject</ThemedText>
                  </Pressable>
                  <Pressable className="bg-primary rounded-[12px] p-[12px]" onPress={onAccept}>
                    <ThemedText className="text-white text-[16px]">Accept</ThemedText>
                  </Pressable>
                </>
              )}
            </View>
          </>
        )}

        {isInProgressOrderStatus(order.status) && (
          <View className="flex-row items-center gap-x-[10px] justify-end">
            <Pressable className="rounded-[12px] p-[10px] border border-secondaryTextColor/50" onPress={() => router.push(`/orders/${order.id}`)}>
              <ThemedText className="text-secondaryTextColor text-[17px]">View Order</ThemedText>
            </Pressable>
            {order.status === ORDER_STATUS.OUT_FOR_DELIVERY && (
              <Pressable className="bg-[#22AB03] rounded-[12px] p-[12px]" onPress={onMarkAsDeliveredClick}>
                <ThemedText className="text-white text-[17px]">Mark as delivered</ThemedText>
              </Pressable>
            )}
          </View>
        )}

        {order.status === ORDER_STATUS.DELIVERED && (
          <View className="flex-row items-center gap-x-[10px] justify-between">
            <View>
              <View className="flex-row items-center gap-x-[10px]">
                <ThemedText className="text-[#22AB03]" size="subheading">Paid</ThemedText>
                <View className="h-[5px] w-[5px] bg-[#22AB03] rounded-full" />
                <ThemedText className="text-[#22AB03]" size="subheading">Prepaid</ThemedText>
              </View>
              <ThemedText className="font-semibold" size="heading">Total: {getFormattedPrice(Number(order.total))}</ThemedText>
            </View>
            <Pressable className="rounded-[12px] p-[10px] border border-secondaryTextColor/50" disabled={isDownloading}
              onPress={() => downloadInvoice(order.id, order.order_number)}>
              {isDownloading ? <ActivityIndicator size="small" color={Colors.primary} /> : (
                <ThemedText className="text-secondaryTextColor text-[17px]">Download Invoice</ThemedText>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};
