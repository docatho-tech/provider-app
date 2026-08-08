import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text } from "react-native";

const SearchBar = () => {
  const router = useRouter();
  return (
    <Pressable className=' bg-white flex-row justify-start gap-[10px] items-center px-[10px] py-[8px] rounded-default border border-[#000000]/10' onPress={() => router.push('/search-product')}>
      <MaterialCommunityIcons name="magnify" size={24} color="#8F959E" />
      <Text className='text-[#313131]/80'>Search medicines in catalogue</Text>
    </Pressable>
  )
}

export default SearchBar
