import ThemedText from '@/components/common/ThemedText'
import { ScreenHeader } from '@/components/layout/Headers'
import { Card } from '@/components/ui/Card'
import { ActionButton, Chip, FilterChip, SearchField, StickyFooter } from '@/components/ui/Primitives'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import useCustomSafeAreaInsets from '@/hooks/useCustomSafeAreaInsets'
import { CatalogItem, ProviderCatalog } from '@/interfaces/provider'
import { getFormattedPrice } from '@/utils/base'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, Switch, View } from 'react-native'
import Toast from 'react-native-toast-message'

/**
 * What this partner offers, and what it is currently able to supply.
 *
 * The lab's tests and the pharmacy's medicines are one screen — same card, same
 * filter strip, same switch — so the server says which noun it is answering
 * about and the screen titles itself from that rather than existing twice.
 *
 * The switches are batched behind "Save changes" rather than saved on toggle:
 * a partner going down the list marking what they are out of is making one
 * decision about a morning, and a request per flick would half-apply it on a
 * bad connection.
 */
const CatalogScreen = () => {
  const { bottom } = useCustomSafeAreaInsets()
  const [catalog, setCatalog] = useState<ProviderCatalog | null>(null)
  const [pending, setPending] = useState<Record<number, boolean>>({})
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const { requestGET, isLoading, error } = useAxios<ProviderCatalog>(API_ENDPOINTS.PARTNER_CATALOG)
  const { requestPATCH, isLoading: saving } = useAxios<ProviderCatalog>(API_ENDPOINTS.PARTNER_CATALOG)

  const load = async () => {
    const res = await requestGET()
    if (res.status === 200) {
      setCatalog(res.data)
      setPending({})
    }
  }

  useEffect(() => { load() }, [])
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }

  const availability = (item: CatalogItem) => pending[item.id] ?? item.is_available

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return (catalog?.items ?? [])
      .filter((item) => category === 'All' || item.category === category)
      .filter((item) => !needle || [item.name, item.code, item.category]
        .some((field) => (field ?? '').toLowerCase().includes(needle)))
  }, [catalog, category, query])

  const save = async () => {
    const items = Object.entries(pending).map(([id, is_available]) => ({ id: Number(id), is_available }))
    if (items.length === 0) {
      Toast.show({ type: 'info', text1: 'Nothing to save' })
      return
    }
    const res = await requestPATCH({ items })
    if (res.status === 200) {
      setCatalog(res.data)
      setPending({})
      Toast.show({ type: 'success', text1: 'Catalog updated' })
    }
  }

  if (isLoading && !catalog) {
    return (
      <View className='flex-1 bg-page'>
        <ScreenHeader title='Catalog' backButtonRoute='/profile' />
        <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
      </View>
    )
  }

  const categories = ['All', ...(catalog?.categories ?? [])]

  return (
    <View className='flex-1 bg-page'>
      <ScreenHeader title={catalog?.title ?? 'Catalog'} backButtonRoute='/profile' />

      <View className='px-[16px] pb-[12px]'>
        <SearchField
          placeholder={catalog?.search_placeholder ?? 'Search'}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className='flex-grow-0'
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 14, gap: 8 }}
      >
        {categories.map((name) => (
          <FilterChip key={name} label={name} active={category === name} onPress={() => setCategory(name)} />
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 14 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {filtered.length === 0 ? (
          <ThemedText size='small' className='text-center mt-[30px]' style={{ color: Colors.mutedTextColor }}>
            {error ? 'Could not load the catalog. Pull to refresh.' : 'Nothing matches that'}
          </ThemedText>
        ) : filtered.map((item) => (
          <CatalogCard
            key={item.id}
            item={item}
            kind={catalog?.kind ?? 'medicines'}
            available={availability(item)}
            onToggle={(next) => setPending((current) => ({ ...current, [item.id]: next }))}
          />
        ))}
      </ScrollView>

      <StickyFooter bottomInset={bottom}>
        <View className='flex-1'>
          <ActionButton title='Save changes' tone='primary' loading={saving} onPress={save} />
        </View>
      </StickyFooter>
    </View>
  )
}

const CatalogCard = ({ item, kind, available, onToggle }: {
  item: CatalogItem
  kind: 'medicines' | 'tests'
  available: boolean
  onToggle: (next: boolean) => void
}) => (
  <Card>
    <View className='p-[16px]'>
      <View className='flex-row items-start justify-between gap-x-[12px]'>
        <View className='flex-row items-center gap-x-[10px] flex-1'>
          {kind === 'tests'
            ? <MaterialCommunityIcons name='water-outline' size={17} color={Colors.primaryTextColor} />
            : <FontAwesome5 name='capsules' size={15} color={Colors.primaryTextColor} />}
          <ThemedText size='subheading' className='font-semibold flex-1' numberOfLines={1}>{item.name}</ThemedText>
        </View>
        <Chip
          tone={available ? 'success' : 'soft'}
          label={available ? 'Available' : 'Unavailable'}
        />
      </View>

      <View className='flex-row items-center gap-x-[8px] mt-[10px] ml-[27px]'>
        {item.category ? <Chip tone='soft' label={item.category} /> : null}
        {item.detail ? <Chip tone='outline' label={item.detail} /> : null}
      </View>

      <View className='flex-row items-end justify-between gap-x-[12px] mt-[12px]'>
        <View className='flex-1 ml-[27px]'>
          <ThemedText size='small' style={{ color: Colors.secondaryTextColor }}>
            {[item.code ? `Code ${item.code}` : null, item.meta].filter(Boolean).join('  •  ') || '—'}
          </ThemedText>
          <ThemedText size='small' className='font-semibold mt-[6px]'>
            MRP {getFormattedPrice(Number(item.mrp ?? 0))}
            {'  •  '}
            Partner Price {getFormattedPrice(Number(item.partner_price ?? 0))}
          </ThemedText>
        </View>
        <Switch
          value={available}
          onValueChange={onToggle}
          trackColor={{ true: Colors.primary, false: '#D9D9D9' }}
          // iOS renders an unset thumb colour as a blown-out white against the
          // blue track; naming it keeps the two platforms the same switch.
          thumbColor='#FFFFFF'
        />
      </View>
    </View>

    {/* An unread hint costs nothing and answers "why is the button greyed": */}
    {!available ? (
      <View className='px-[16px] pb-[14px]'>
        <ThemedText size='small' style={{ color: Colors.mutedTextColor }}>
          <Feather name='alert-circle' size={12} color={Colors.mutedTextColor} /> Patients cannot book this right now.
        </ThemedText>
      </View>
    ) : null}
  </Card>
)

export default CatalogScreen
