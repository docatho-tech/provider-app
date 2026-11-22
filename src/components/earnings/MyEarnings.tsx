import ThemedText from '@/components/common/ThemedText'
import { ScreenHeader } from '@/components/layout/Headers'
import { Card, CardRow } from '@/components/ui/Card'
import { ActionButton, Chip } from '@/components/ui/Primitives'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import useDownloadFile from '@/hooks/useDownloadFile'
import { EarningsLine, NextPayout, ProviderEarnings } from '@/interfaces/provider'
import { getFormattedPrice } from '@/utils/base'
import { dayLabel, timeLabel } from '@/utils/schedule'
import Feather from '@expo/vector-icons/Feather'
import { RelativePathString, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native'

/**
 * What the partner has earned, when it arrives, and the lines it is made of.
 *
 * The screen has three shapes and they are three answers to one question —
 * "where is my money": nothing earned yet, earned but nowhere to send it, and
 * earned with a transfer already scheduled. The middle one is the reason the
 * bank prompt is a banner inside the payout card rather than a settings row
 * somewhere else: money is waiting and it cannot move.
 */
const MyEarnings = ({ backRoute = '/' }: { backRoute?: string }) => {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const { requestGET, response, isLoading, error } = useAxios<ProviderEarnings>(API_ENDPOINTS.EARNINGS)
  const { downloadFile, isDownloading } = useDownloadFile()

  useEffect(() => { requestGET() }, [])
  const onRefresh = async () => { setRefreshing(true); await requestGET(); setRefreshing(false) }

  const payout = response?.next_payout
  const lines = response?.lines ?? []
  const hasEarnings = lines.length > 0 || Number(response?.payout ?? 0) > 0

  if (isLoading && !response) {
    return (
      <View className='flex-1 bg-page'>
        <ScreenHeader title='My Earnings' backButtonRoute={backRoute} />
        <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
      </View>
    )
  }

  return (
    <View className='flex-1 bg-page'>
      <ScreenHeader title='My Earnings' backButtonRoute={backRoute} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {!hasEarnings ? (
          <EmptyEarnings error={!!error} onGoToDashboard={() => router.push('/')} />
        ) : (
          <>
            {payout?.has_bank ? null : (
              <Card className='mb-[20px]'>
                <View className='p-[16px]'>
                  <ThemedText size='heading' className='font-bold'>
                    {getFormattedPrice(Number(response?.week_total ?? 0), { decimals: 2 })}
                  </ThemedText>
                  <ThemedText size='small' className='mt-[4px]' style={{ color: Colors.secondaryTextColor }}>
                    Total Earnings This Week
                  </ThemedText>
                </View>
              </Card>
            )}

            <ThemedText size='subheading' className='font-bold mb-[10px]'>Next Payout</ThemedText>
            {payout ? (
              <PayoutCard
                payout={payout}
                onAddBank={() => router.push('/bank' as RelativePathString)}
                downloading={isDownloading}
                // The payout card is about one transfer, and the month behind
                // it is the window a partner checks a transfer against.
                onStatement={() => downloadFile({
                  endpoint: API_ENDPOINTS.STATEMENT,
                  params: { period: 'month' },
                  fileName: 'docatho-statement.csv',
                  mimeType: 'text/csv',
                  dialogTitle: 'Earnings statement',
                  UTI: 'public.comma-separated-values-text',
                })}
              />
            ) : null}

            <View className='flex-row items-center justify-between mt-[20px] mb-[10px]'>
              <ThemedText size='subheading' className='font-bold'>
                {payout?.has_bank ? 'Earnings History' : 'Earnings breakdown'}
              </ThemedText>
              <Pressable
                className='flex-row items-center gap-x-[6px]'
                onPress={() => router.push('/insights' as RelativePathString)}
              >
                <ThemedText size='small' className='text-primary font-semibold'>Insights</ThemedText>
                <Feather name='bar-chart-2' size={15} color={Colors.primary} />
              </Pressable>
            </View>
            <Card>
              {lines.map((line, index) => (
                <EarningsRow key={line.id} line={line} first={index === 0} />
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const PayoutCard = ({ payout, onAddBank, onStatement, downloading = false }: {
  payout: NextPayout
  onAddBank: () => void
  onStatement: () => void
  downloading?: boolean
}) => {
  const amount = getFormattedPrice(Number(payout.amount), { decimals: 2 })
  const when = new Date(payout.credited_on).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  if (!payout.has_bank) {
    return (
      <Card>
        <View className='p-[16px]'>
          <ThemedText size='subheading' className='font-semibold'>
            {amount} will be credited on {when}
          </ThemedText>
          <ThemedText size='subheading' className='mt-[10px]'>No Bank details found</ThemedText>

          <View
            className='rounded-[10px] p-[14px] mt-[14px]'
            style={{ backgroundColor: Colors.noticeBg, borderWidth: 1, borderColor: Colors.noticeBorder }}
          >
            <View className='flex-row items-center gap-x-[8px]'>
              <Feather name='info' size={15} color={Colors.noticeText} />
              <ThemedText size='small' className='flex-1' style={{ color: Colors.noticeText }}>
                Add bank account to receive payouts.
              </ThemedText>
            </View>
            <Pressable
              onPress={onAddBank}
              className='rounded-[8px] h-[44px] items-center justify-center mt-[12px]'
              style={{ borderWidth: 1, borderColor: Colors.noticeBorder }}
            >
              <ThemedText size='subheading' className='font-semibold' style={{ color: Colors.noticeText }}>
                + Add bank now
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Card>
    )
  }

  return (
    <Card>
      <View className='p-[16px]'>
        <View className='flex-row items-start justify-between gap-x-[12px]'>
          <ThemedText size='heading' className='font-bold flex-1'>{amount}</ThemedText>
          <Chip tone='success' label='Scheduled' />
        </View>
        <ThemedText size='subheading' className='mt-[6px]'>
          Will be credited on <ThemedText size='subheading' className='font-bold'>{when}</ThemedText>
        </ThemedText>
        <ThemedText size='small' className='mt-[8px]' style={{ color: Colors.secondaryTextColor }}>
          {payout.bank_name} • • • • {payout.bank_last4}
        </ThemedText>

        <View className='flex-row items-center gap-x-[12px] mt-[16px]'>
          <View className='flex-1'>
            <ActionButton title='Update Bank Details' tone='outlinePrimary' size='sm' onPress={onAddBank} />
          </View>
          <View className='flex-1'>
            <ActionButton
              title='Download Statement'
              tone='neutral'
              size='sm'
              loading={downloading}
              onPress={onStatement}
            />
          </View>
        </View>
      </View>
    </Card>
  )
}

/** "Consultation • Aarav", what it was worth, and what is left after the cut. */
const EarningsRow = ({ line, first }: { line: EarningsLine; first: boolean }) => {
  const online = line.mode === 'online'
  const modeLabel = MODE_LABELS[line.mode] ?? line.mode

  return (
    <CardRow first={first}>
      <View className='flex-row items-start justify-between gap-x-[12px]'>
        <View className='flex-1'>
          <View className='flex-row items-center gap-x-[6px]'>
            <ThemedText size='standard' className='font-bold'>{line.kind}</ThemedText>
            <View className='h-[4px] w-[4px] rounded-full' style={{ backgroundColor: Colors.primaryTextColor }} />
            <ThemedText size='standard' className='font-bold flex-1' numberOfLines={1}>{line.name}</ThemedText>
          </View>

          <View className='flex-row items-center gap-x-[6px] mt-[6px]'>
            <ThemedText size='small'>{getFormattedPrice(Number(line.amount))}</ThemedText>
            {modeLabel ? (
              <>
                <View className='h-[3px] w-[3px] rounded-full' style={{ backgroundColor: Colors.mutedTextColor }} />
                <Feather name={online ? 'video' : 'home'} size={12} color={Colors.primary} />
                <ThemedText size='small' className='text-primary'>{modeLabel}</ThemedText>
              </>
            ) : null}
          </View>

          <ThemedText size='small' className='mt-[6px]' style={{ color: Colors.mutedTextColor }}>
            {dayLabel(line.at)} {timeLabel(line.at)}
          </ThemedText>
        </View>

        <View className='items-end'>
          <ThemedText size='small' style={{ color: Colors.danger }}>
            -{getFormattedPrice(Number(line.platform_fee))} Platform fee
          </ThemedText>
          <ThemedText size='standard' className='font-bold mt-[6px]'>
            {getFormattedPrice(Number(line.net))} Net pay
          </ThemedText>
        </View>
      </View>
    </CardRow>
  )
}

/** The mode each persona's lines carry, in the words the design uses. */
const MODE_LABELS: Record<string, string> = {
  online: 'Online consultation',
  in_clinic: 'In-clinic consultation',
  home_visit: 'Home visit',
  at_centre: 'Walk-in',
  home_pickup: 'Home pickup',
  cod: 'Cash on delivery',
  razorpay: 'Prepaid',
}

const EmptyEarnings = ({ error, onGoToDashboard }: { error: boolean; onGoToDashboard: () => void }) => (
  <View className='flex-1 justify-center' style={{ minHeight: 480 }}>
    <Card>
      <View className='items-center px-[24px] py-[36px]'>
        <Feather name='credit-card' size={44} color='#C9C9C9' />
        <ThemedText size='heading' className='font-bold mt-[16px]'>
          {error ? 'Could not load earnings' : 'No earnings yet'}
        </ThemedText>
        <ThemedText size='small' className='mt-[6px] text-center' style={{ color: Colors.secondaryTextColor }}>
          {error ? 'Pull to refresh and try again' : 'Start consulting to see your earnings here'}
        </ThemedText>
        <Pressable
          onPress={onGoToDashboard}
          className='rounded-[8px] h-[44px] px-[22px] items-center justify-center mt-[18px]'
          style={{ borderWidth: 1, borderColor: '#D9D9D9' }}
        >
          <ThemedText size='standard' className='font-semibold'>Go to dashboard</ThemedText>
        </Pressable>
      </View>
    </Card>
  </View>
)

export default MyEarnings
