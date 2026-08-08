import ThemedText from '@/components/common/ThemedText'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import { ProviderEarnings } from '@/interfaces/provider'
import { getFormattedPrice } from '@/utils/base'
import React, { useCallback, useEffect } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native'

const StatCard = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <View className={`flex-1 rounded-[12px] p-[16px] border ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-white border-primary/10'}`}>
    <ThemedText size='small' className='text-secondaryTextColor'>{label}</ThemedText>
    <ThemedText size='heading' className={`font-semibold mt-[6px] ${highlight ? 'text-primary' : ''}`}>{value}</ThemedText>
  </View>
)

const EarningsScreen = () => {
  const { requestGET, response, isLoading, error } = useAxios<ProviderEarnings>(API_ENDPOINTS.EARNINGS)
  const [refreshing, setRefreshing] = React.useState(false)

  const load = useCallback(async () => {
    await requestGET()
  }, [])

  useEffect(() => {
    load()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  if (isLoading && !response) {
    return <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
  }

  const earnings = response

  return (
    <ScrollView
      className='flex-1 bg-[#F7F9FC] px-[5%] pt-[20px]'
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <ThemedText size='largeHeading' className='font-bold'>Earnings</ThemedText>
      <ThemedText className='text-secondaryTextColor mt-[6px]'>From delivered and paid orders</ThemedText>

      {error && !earnings ? (
        <View className='mt-[40px] items-center'>
          <ThemedText className='text-secondaryTextColor text-center'>Could not load earnings. Pull to refresh.</ThemedText>
        </View>
      ) : earnings ? (
        <View className='mt-[20px] gap-[12px]'>
          <View className='flex-row gap-[12px]'>
            <StatCard label='Total orders' value={String(earnings.total_orders)} />
            <StatCard label='Your payout' value={getFormattedPrice(Number(earnings.payout))} highlight />
          </View>
          <View className='flex-row gap-[12px]'>
            <StatCard label='Gross revenue' value={getFormattedPrice(Number(earnings.gross))} />
            <StatCard label='Commission' value={getFormattedPrice(Number(earnings.commission))} />
          </View>
          <View className='bg-white rounded-[12px] p-[16px] border border-amber-200 mt-[4px]'>
            <ThemedText size='small' className='text-secondaryTextColor'>Pending payout</ThemedText>
            <ThemedText size='heading' className='font-semibold text-amber-700 mt-[6px]'>
              {getFormattedPrice(Number(earnings.pending_payout))}
            </ThemedText>
            <ThemedText size='small' className='text-secondaryTextColor mt-[8px]'>
              Awaiting delivery or payment confirmation
            </ThemedText>
          </View>
        </View>
      ) : null}
      <View className='h-[40px]' />
    </ScrollView>
  )
}

export default EarningsScreen
