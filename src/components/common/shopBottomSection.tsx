import { RelativePathString, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ShopBottomSectionProps {
  totalItemsSelected?: number;
  totalPrice?: string | null;
  totalDiscountedPrice?: string | null;
  buttonName: string
  buttonRedirectTo?: string | RelativePathString
  buttonAction?: () => void
  disabled?: boolean
}

const ShopBottomSection = ({ totalItemsSelected, totalPrice, totalDiscountedPrice, buttonName, buttonRedirectTo, buttonAction, disabled = false }: ShopBottomSectionProps) => {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();

  const handleButtonPress = () => {
    if (buttonAction) {
      buttonAction();
    } else {
      router.push(buttonRedirectTo as RelativePathString);
    }
  }
  return (
    <View
      className='absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-[7%] pt-[20px]'
      style={{
        paddingBottom: bottom,
        boxShadow: '0px -7.59px 12px 0px #00000014',
      }}
    >
      <View className={`flex-row justify-end ${totalItemsSelected && totalPrice !== undefined && totalDiscountedPrice !== undefined ? 'justify-between gap-[6px]' : 'justify-end'}`}>
        <View className='w-[43%]'>
          {
            totalItemsSelected !== undefined && (
              <View className='flex-row items-center gap-2'>
                <Text className='text-[#B48200] text-[14px]'> {totalItemsSelected} items selected </Text>
              </View>
            )
          }
          {
            totalPrice !== undefined && totalDiscountedPrice !== undefined && (
              <View className='items-start gap-[0px]'>
                <Text className='text-primaryText text-[20px]'> {totalDiscountedPrice} </Text>
                <Text className='text-[#939393] text-[14px] mt-1 line-through'> {totalPrice} </Text>
              </View>
            )
          }
        </View>
        <Pressable 
          disabled={disabled ? disabled : false} 
          className='bg-primary px-[20px] py-4 rounded-lg self-start max-w-[57%] items-center justify-center' 
          onPress={handleButtonPress}
        >
          <Text className='text-white font-semibold text-[12px]'> {buttonName} </Text>
        </Pressable>
      </View>
    </View>
  )
}

export default ShopBottomSection