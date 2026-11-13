import ThemedText from '@/components/common/ThemedText'
import PeriodSheet, { PeriodValue, periodLabel, periodParams } from '@/components/insights/PeriodSheet'
import { Card } from '@/components/ui/Card'
import { Sparkline } from '@/components/ui/Sparkline'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import useDownloadFile from '@/hooks/useDownloadFile'
import { InsightMetric, ProviderInsights } from '@/interfaces/provider'
import { getFormattedPrice } from '@/utils/base'
import Feather from '@expo/vector-icons/Feather'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, useWindowDimensions, View } from 'react-native'

/**
 * How the partner's week went, one card per metric.
 *
 * Which metrics depends on the persona and the server decides that, not the
 * app: a doctor counts consultations, a centre counts tests, a pharmacy counts
 * orders, and each already knows which of its own rows to count. The screen
 * only has to draw whatever it is handed.
 */
const InsightsScreen = () => {
  const { width } = useWindowDimensions()
  const [period, setPeriod] = useState<PeriodValue>({ period: 'week' })
  const [picking, setPicking] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { requestGET, response, isLoading, error } = useAxios<ProviderInsights>(API_ENDPOINTS.INSIGHTS)
  const { downloadFile, isDownloading } = useDownloadFile()

  const params = periodParams(period)
  useEffect(() => { requestGET(params) }, [period])
  const onRefresh = async () => { setRefreshing(true); await requestGET(params); setRefreshing(false) }

  // The card is the page gutter and its own padding in from each edge.
  const chartWidth = width - 32 - 32

  return (
    <View className='flex-1 bg-page'>
      {isLoading && !response ? (
        <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          <View className='flex-row items-center gap-x-[12px]'>
            <Pressable
              className='flex-1 flex-row items-center justify-between bg-white rounded-[10px] h-[48px] px-[14px]'
              style={{ borderWidth: 1, borderColor: Colors.cardBorder }}
              onPress={() => setPicking(true)}
            >
              <ThemedText size='standard' numberOfLines={1}>{periodLabel(period)}</ThemedText>
              <Feather name='calendar' size={17} color={Colors.primaryTextColor} />
            </Pressable>

            <Pressable
              className='flex-row items-center gap-x-[8px] bg-white rounded-[10px] h-[48px] px-[16px]'
              style={{ borderWidth: 1, borderColor: Colors.cardBorder }}
              // The window on screen is the window exported — the charts and
              // the CSV resolve the same params server-side.
              onPress={() => downloadFile({
                endpoint: API_ENDPOINTS.STATEMENT,
                params,
                fileName: 'docatho-statement.csv',
                mimeType: 'text/csv',
                dialogTitle: 'Export earnings',
                UTI: 'public.comma-separated-values-text',
              })}
            >
              <ThemedText size='standard'>Export</ThemedText>
              {isDownloading
                ? <ActivityIndicator size='small' color={Colors.primaryTextColor} />
                : <Feather name='download' size={16} color={Colors.primaryTextColor} />}
            </Pressable>
          </View>

          <ThemedText size='subheading' className='font-bold mt-[16px] mb-[10px]'>Earnings History</ThemedText>

          {error && !response ? (
            <ThemedText size='small' className='text-center mt-[20px]' style={{ color: Colors.mutedTextColor }}>
              Could not load insights. Pull to refresh.
            </ThemedText>
          ) : null}

          <View className='gap-[16px]'>
            {response?.metrics.map((metric) => (
              <MetricCard
                key={metric.key}
                metric={metric}
                labels={response.labels}
                width={chartWidth}
              />
            ))}
          </View>
        </ScrollView>
      )}

      <PeriodSheet
        show={picking}
        value={period}
        onClose={() => setPicking(false)}
        onApply={(chosen) => { setPeriod(chosen); setPicking(false) }}
      />
    </View>
  )
}

const MetricCard = ({ metric, labels, width }: {
  metric: InsightMetric
  labels: string[]
  width: number
}) => (
  <Card>
    <View className='p-[16px]'>
      <ThemedText size='subheading' className='font-semibold'>{metric.label}</ThemedText>
      <ThemedText size='heading' className='mt-[4px]' style={{ color: metric.color }}>
        {metric.format === 'money'
          ? getFormattedPrice(metric.value, { symbol: false })
          : metric.value}
      </ThemedText>
      <View className='mt-[14px]'>
        <Sparkline
          series={metric.series}
          previous={metric.previous}
          labels={labels}
          color={metric.color}
          width={width}
        />
      </View>
    </View>
  </Card>
)

export default InsightsScreen
