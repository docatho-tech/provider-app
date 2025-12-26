import { Colors } from "@/constants/Colors";
import Images from "@/constants/Images";
import useCustomSafeAreaInsets from "@/hooks/useCustomSafeAreaInsets";
import { Entypo } from "@expo/vector-icons";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from "expo-router";
import React from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";

export const HomeHeader = ({ name, profilePicture }: { name: string, profilePicture?: string }) => {
  const {top} = useCustomSafeAreaInsets();


  return (
    <View className="flex-row items-center justify-between bg-primary px-[5%] pb-[20px] rounded-b-[20px]" style={{ paddingTop: top }}>
      <Text className="text-[20px] text-white font-semibold w-[60%]" numberOfLines={1}> Hey! {name} 👋 </Text>

      <View className="flex-row items-center gap-x-[20px]">
        <Pressable>
          <FontAwesome name="bell" size={22} color="white" />
        </Pressable>
        <Image 
          source={Images.profileIcon}
          className="w-[35px] h-[35px] rounded-full"
        />
      </View>
    </View>
  )
}

export const HeaderWithCart = ({ routeName, backgroundColor = "transparent" }: { routeName: string, backgroundColor?: string }) => {
  const {top} = useCustomSafeAreaInsets();  

  return (
    <View className='flex-row items-center justify-between px-[5%] pb-[10px]' style={{ paddingTop: top, backgroundColor: backgroundColor || "transparent" }}>
      <HeaderLeftStandard routeName={routeName} />

      <Pressable className='flex-row items-center gap-x-[10px] py-[10px] px-[15px] rounded-[18px]' onPress={() => {}}>
        <View className='relative'>
          <FontAwesome name="shopping-cart" size={24} color={Colors.primary} />
        </View>
        <Text className='text-[20px] text-primaryTextColor'>Cart</Text>
      </Pressable>
    </View>
  )
}

export const HeaderWithBackButton = ({ routeName, backgroundColor = "transparent" }: { routeName: string, backgroundColor?: string }) => {
  const {top} = useCustomSafeAreaInsets();  
  return (
    <View className='flex-row items-center justify-between px-[5%] pb-[10px]' style={{ paddingTop: top, backgroundColor: backgroundColor || "transparent" }}>
      <HeaderLeftStandard routeName={routeName} />
    </View>
  )
}

export const HeaderLeftStandard = ({ routeName, showBackButton = true, backgroundColor = "transparent" }: { routeName: string, showBackButton?: boolean, backgroundColor?: string }) => {
  return (
    <View className='flex-row items-center gap-x-[10px]' style={{ backgroundColor: backgroundColor || "transparent" }}>
      <TouchableOpacity onPress={() => router.back()}>
        {showBackButton && <Entypo name="chevron-thin-left" size={20} color={Colors.primaryTextColor} />}
      </TouchableOpacity>

      <View className='flex-row items-center justify-start gap-[10px]'>
        <Text className='text-primaryText text-[25px] font-semibold'> {routeName} </Text>
      </View>
    </View>
  )
}

