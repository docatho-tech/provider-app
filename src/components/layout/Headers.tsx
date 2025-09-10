import { Entypo } from "@expo/vector-icons"
import { router } from "expo-router"
import React from 'react'
import { Text, TouchableOpacity, View } from "react-native"

interface HeaderLeftStandardProps {
  routeName: string, 
  showBackButton?: boolean, 
  showMenu?: boolean, 
  showHomeButton?: boolean 
}

export const HeaderLeftStandard = ({ routeName, showBackButton = true, showMenu = true, showHomeButton = false }: HeaderLeftStandardProps) => {
  return (
    <View className='flex-row items-center gap-x-[10px]'>
      <TouchableOpacity onPress={() => router.back()}>
        {showBackButton && <Entypo name="chevron-thin-left" size={22} color="black" />}
      </TouchableOpacity>

      {
        showHomeButton && (
          <TouchableOpacity onPress={() => router.push('/')}>
            <Entypo name="home" size={22} color="black" />
          </TouchableOpacity>
        )
      }

      <View className='flex-row items-center justify-start gap-[10px]'>
        <Text className='text-primaryText text-[18px] font-normal'> {routeName} </Text>
      </View>
    </View>
  )
}