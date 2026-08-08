import ThemedText from '@/components/common/ThemedText'
import CustomFlatList from '@/components/general/CustomFlatList'
import Input from '@/components/general/Input'
import ArrowLeft from '@/components/icons/ArrowLeft'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useCustomSafeAreaInsets from '@/hooks/useCustomSafeAreaInsets'
import useDebounce from '@/hooks/useDebounce'
import useAxios from '@/hooks/useAxios'
import { MedicineProduct, MedicineSearchResponse } from '@/interfaces/provider'
import { getFormattedPrice } from '@/utils/base'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'

const SearchProduct = () => {
  const { top, bottom } = useCustomSafeAreaInsets()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<MedicineProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounce = useDebounce()
  const { requestGET } = useAxios<MedicineSearchResponse>(API_ENDPOINTS.MEDICINES)

  useEffect(() => {
    debounce(() => { handleSearch() }, 500)
  }, [searchQuery])

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setProducts([]); return }
    setIsSearching(true)
    const res = await requestGET({ search: searchQuery.trim(), page: 1, page_size: 20 })
    if (res.status === 200) setProducts(res.data.results)
    setIsSearching(false)
  }

  return (
    <View className='flex-1 bg-[#F7F9FC] px-[5%]' style={{ paddingTop: top }}>
      <Pressable className='flex-row items-center gap-[10px] mb-[10px]' onPress={() => router.back()}>
        <ArrowLeft color={Colors.primaryTextColor} />
        <ThemedText className='font-semibold'>Search medicines</ThemedText>
      </Pressable>
      <Input placeholder='Search by name, brand, or manufacturer' value={searchQuery} onChange={setSearchQuery}
        inputClassName='border border-[#000000]/10 rounded-default h-[50px] px-[10px] bg-white' />
      {isSearching ? (
        <View className='flex-1 justify-center items-center'><ActivityIndicator size='large' color={Colors.primary} /></View>
      ) : (
        <CustomFlatList data={products} gap={10} renderItem={({ item }) => <ProductItem item={item} />}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<ThemedText size='subheading' className='font-semibold text-secondaryTextColor mt-[20px]'>
            {searchQuery.trim() ? 'No medicines found' : 'Type to search the catalogue'}</ThemedText>}
          ListHeaderComponent={<View className='h-[10px]' />} ListFooterComponent={<View style={{ height: bottom }} />} />
      )}
    </View>
  )
}

const ProductItem = ({ item }: { item: MedicineProduct }) => (
  <View className='bg-white rounded-[10px] p-[12px] border border-primary/10'>
    <View className='flex-row items-center gap-[12px]'>
      <View className='bg-primary/10 rounded-[8px] w-[40px] h-[40px] items-center justify-center'>
        <FontAwesome5 name='capsules' size={18} color={Colors.primary} />
      </View>
      <View className='flex-1'>
        <ThemedText size='small' className='font-semibold' numberOfLines={2}>{item.name}</ThemedText>
        <ThemedText size='small' className='text-secondaryTextColor mt-[2px]' numberOfLines={1}>{item.manufacturer}</ThemedText>
        <View className='flex-row items-center gap-[6px] mt-[4px]'>
          <ThemedText className='font-semibold text-[12px]'>{getFormattedPrice(Number(item.price))}</ThemedText>
          <ThemedText className='text-secondaryTextColor line-through text-[11px]'>{getFormattedPrice(Number(item.mrp))}</ThemedText>
          <ThemedText size='small' className='text-secondaryTextColor'>· Stock: {item.stock}</ThemedText>
        </View>
      </View>
    </View>
  </View>
)

export default SearchProduct
