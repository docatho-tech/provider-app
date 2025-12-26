import { API_ENDPOINTS } from "@/constants/APIEndpoints";
import { Colors } from "@/constants/Colors";
import useAxios from "@/hooks/useAxios";
import { iOrder, iOrderListResponse } from "@/interfaces/order";
import { getFormattedPrice, getNextPageNumberFromURL, replaceUrlParams } from "@/utils/base";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import Chips from "../common/Chips";
import Separator from "../common/Separator";
import Tabs from "../common/Tabs";
import ThemedText from "../common/ThemedText";
import CustomFlatList from "../general/CustomFlatList";
import Select from "../general/Select";
import Box from "../icons/Box";
import Call from "../icons/Call";
import Location from "../icons/Location";

const TAB_ITEMS = Object.freeze({
  placed: {
    label: 'New',
    value: 'placed'
  },
  processing: {
    label: 'In Progress',
    value: 'processing'
  },
  delivered: {
    label: 'Completed',
    value: 'delivered'
  },
})

const ESTIMATED_DELIVERY_MINUTES = Object.freeze({
  ONE_HOUR : {
    label: '1 Hour',
    value: 60
  },
  TWO_HOURS : {
    label: '2 Hours',
    value: 120
  },
  TWENTY_FOUR_HOURS : {
    label: '24 Hours',
    value: 1440
  },
})

export default function ChemistHomePage() {
  const { requestGET: getOrderList, response: orderListResponse } = useAxios<iOrderListResponse>(API_ENDPOINTS.ORDER_LIST, true);
  const { requestPATCH: updateOrderStatus, response: updateOrderStatusResponse } = useAxios<iOrder>(API_ENDPOINTS.UPDATE_ORDER_STATUS, true);

  const [selectedStatus, setSelectedStatus] = useState<string>(TAB_ITEMS.placed.value);
  const [selectedEstimatedDeliveryMinutes, setSelectedEstimatedDeliveryMinutes] = useState<{ orderID: number, estimatedDeliveryMinutes: number | null } | null>(null);
  const [showSelect, setShowSelect] = useState<boolean>(false);

  useEffect(() => {
    getOrderList({
      page: 1,
      page_size: 10,
      status: selectedStatus
    });
  }, [selectedStatus]);

  useEffect(() => {
    if (selectedEstimatedDeliveryMinutes && selectedEstimatedDeliveryMinutes.estimatedDeliveryMinutes) {
      handleMarkAsDelivered(selectedEstimatedDeliveryMinutes.orderID, selectedEstimatedDeliveryMinutes.estimatedDeliveryMinutes as number);
    }
  }, [selectedEstimatedDeliveryMinutes]);

  const formattedEstimatedDeliveryMinutes = useMemo(() => {
    return Object.values(ESTIMATED_DELIVERY_MINUTES).map((item) => ({
      label: item.label,
      value: item.value.toString(),
    }));
  }, []);

  const handlePageChange = () => {
    if(orderListResponse?.next) {
      const nextPageNumber = getNextPageNumberFromURL(orderListResponse.next);
      if(nextPageNumber) {
        getOrderList({
          page: nextPageNumber,
          page_size: 10,
          status: selectedStatus
        });
      }
      return nextPageNumber;
    }
    return null;
  }

  const handleMarkAsDelivered = async (orderId: number, estimatedDeliveryMinutes: number) => {
    setShowSelect(false);
    const body = {
      status: 'delivered',
      estimated_delivery_mins: estimatedDeliveryMinutes
    }

    const localURL = replaceUrlParams(API_ENDPOINTS.UPDATE_ORDER_STATUS, { orderId: orderId });
    const response = await updateOrderStatus(body, localURL);
    if (response.status === 200) {
      setSelectedEstimatedDeliveryMinutes(null);
      Toast.show({
        text1: 'Order marked as delivered',
        type: 'success',
      });

      getOrderList({
        page: 1,
        page_size: 10,
        status: selectedStatus
      });
    }
  }

  return (
    <View className="flex-1 px-[5%]">
      <View className="mt-[20px]">
        <Header selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} />
      </View>
      <CustomFlatList
        data={orderListResponse?.results || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OrderItem order={item} onMarkAsDeliveredClick={(item) => {
          setSelectedEstimatedDeliveryMinutes({ orderID: item.id, estimatedDeliveryMinutes: null })
          setShowSelect(true)
        }} />}
        gap={10}
        ListHeaderComponent={<View className="mt-[10px]" />}
        ListFooterComponent={<View className="mb-[10px]" />}
        ListEmptyComponent={<View className="flex-1 justify-center items-center">
          <ThemedText>No orders found</ThemedText>
        </View>}
        useInfiniteScroll={true}
        infiniteScrollAction={handlePageChange}
      />

      <Select 
        show={showSelect}
        onClose={() => setShowSelect(false)}
        onSave={() => setShowSelect(false)}
        selectedValue={selectedEstimatedDeliveryMinutes?.estimatedDeliveryMinutes?.toString() || ''}
        onValueChange={(value) => setSelectedEstimatedDeliveryMinutes({ orderID: selectedEstimatedDeliveryMinutes?.orderID || 0, estimatedDeliveryMinutes: Number(value.value) })}
        items={formattedEstimatedDeliveryMinutes}
      />
    </View>
  );
}

const Header = ({ selectedStatus, setSelectedStatus }: { selectedStatus: string, setSelectedStatus: (status: string) => void }) => {
  return (
    <View className="">
      <Tabs
        tabs={Object.values(TAB_ITEMS).map((status) => ({
          title: status.label,
          value: status.value,
        }))}
        activeTab={selectedStatus}
        setActiveTab={(tab) => setSelectedStatus(tab)}
      />
    </View>
  )
}

const OrderItem = ({ order, onMarkAsDeliveredClick }: { order: iOrder, onMarkAsDeliveredClick: ( order: iOrder ) => void }) => {
  return (
    <View className="bg-white rounded-[16px] border-primary/10 border">
      <View className="bg-[#F7F7F7] rounded-t-[16px] flex-row items-center gap-x-[10px] px-[15px] pt-[15px] pb-[15px] justify-between">
        <View className={`flex-row items-center gap-x-[10px] flex-wrap ${order.status === 'placed' ? 'w-[100%]' : 'w-[75%]'}`}>
          <Box color={Colors.primary} size={20} />
          <ThemedText size="subheading" className="font-semibold">{order.order_number}</ThemedText>
          <View className="h-[5px] w-[5px] bg-primaryText rounded-full" />
          <ThemedText className="font-semibold">{order.user_name}</ThemedText>
        </View>
        {
          order.status !== 'placed' &&
          <Chips text={order.status} color={ order.status === 'delivered' ? '#2B6436' : 'white' } backgroundColor={ order.status === 'delivered' ? '#D0EBD7' : "#313131CC" } />
        }
      </View>

      <View className="px-[15px] pb-[15px] pt-[10px]">
        <View className="gap-y-[10px]">
          {
            order.items.map((item) => (
              <View key={item.id} className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-x-[10px] w-[80%]">
                  <FontAwesome5 name="capsules" size={18} color={Colors.primaryTextColor} />
                  <ThemedText numberOfLines={1} className="font-semibold">{item.medicine_name}</ThemedText>
                </View>
                <ThemedText className="font-semibold">{item.quantity} Units</ThemedText>
              </View>
            ))
          }
        </View>

        <View className="my-[10px]">
          <Separator />
        </View>

        {
          order.status === 'placed' &&
          <>
            <View className="flex-row items-center gap-x-[10px] mb-[10px]">
              <View className="bg-primary/10 rounded-full p-[5px] w-[30px] h-[30px] items-center justify-center">
                <Location color={Colors.primary} size={16} />
              </View>
              <ThemedText numberOfLines={3} className="w-[90%]"> {order.address?.address_line1} {order.address?.address_line2} {order.address?.landmark} {order.address?.city} {order.address?.state} {order.address?.postal_code} </ThemedText>
            </View>
          

          
            <View className="flex-row items-center gap-x-[10px]">
              <View className="bg-primary/10 rounded-full p-[5px] w-[30px] h-[30px] items-center justify-center">
                <Call color={Colors.primary} size={16} />
              </View>
              <ThemedText numberOfLines={3} className="w-[90%]"> {order.user_phone} </ThemedText>
            </View>
          </>
        }

        {
          order.status !== 'placed' && order.status !== 'delivered' &&
          <View className="flex-row items-center gap-x-[10px]">
            <View className="bg-primary/10 rounded-full p-[5px] w-[30px] h-[30px] items-center justify-center">
              <Location color={Colors.primary} size={16} />
            </View>
            <ThemedText numberOfLines={3} className="w-[90%]"> ETA: {order.estimated_delivery_mins} minutes </ThemedText>
          </View>
        }

        {
          order.status !== 'delivered' &&
          <View className="my-[20px]">
            <Separator />
          </View>
        }

        {
          order.status === 'placed' &&
          <View className="flex-row justify-between items-center">
            <ThemedText className="font-semibold" size="heading"> Total bill </ThemedText>
            <ThemedText className="font-semibold" size="heading"> {getFormattedPrice(Number(order.total))} </ThemedText>
          </View>
        }

        {
          order.status !== 'placed' && order.status !== 'delivered' &&
          <View className="flex-row items-center gap-x-[10px] justify-end">
            <Pressable className="rounded-[12px] p-[10px] border border-secondaryTextColor/50">
              <ThemedText className="text-secondaryTextColor text-[17px]"> View Order </ThemedText>
            </Pressable>
            <Pressable className="bg-[#22AB03] rounded-[12px] p-[12px]" onPress={() => onMarkAsDeliveredClick(order)}>
              <ThemedText className="text-white text-[17px]"> Mark as delivered </ThemedText>
            </Pressable>
          </View>
        }

        {
          order.status === 'delivered' &&
          <View className="flex-row items-center gap-x-[10px] justify-between">
            <View className="">
              <View className="flex-row items-center gap-x-[10px]">
                <ThemedText className="text-[#22AB03]" size="subheading"> Paid </ThemedText>
                <View className="h-[5px] w-[5px] bg-[#22AB03] rounded-full" />
                <ThemedText className="text-[#22AB03]" size="subheading"> Prepaid </ThemedText>
              </View>
              <ThemedText className="font-semibold" size="heading"> Total: {getFormattedPrice(Number(order.total))} </ThemedText>
            </View>
            <Pressable className="rounded-[12px] p-[10px] border border-secondaryTextColor/50">
              <ThemedText className="text-secondaryTextColor text-[17px]"> Download Invoice </ThemedText>
            </Pressable>
          </View>
        }
      </View>
    </View>
  );
}
