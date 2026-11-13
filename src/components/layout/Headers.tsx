import { API_ENDPOINTS } from "@/constants/APIEndpoints";
import { Colors } from "@/constants/Colors";
import Images from "@/constants/Images";
import useAxios from "@/hooks/useAxios";
import useCustomSafeAreaInsets from "@/hooks/useCustomSafeAreaInsets";
import { useAppDispatch, useAppSelector } from "@/hooks/useStoreHooks";
import { getProfileDetails } from "@/store/slices/authenticationSlice";
import { Entypo } from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { RelativePathString, router } from "expo-router";
import React, { useEffect } from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import ThemedText from "../common/ThemedText";

/**
 * The blue band at the top of each persona's dashboard tab.
 *
 * The second line is the branch the partner is signed in as. It is not
 * decoration: a chain runs several, and the greeting alone gave no way to tell
 * which one's queue is on screen.
 */
export const HomeHeader = () => {
  const { top } = useCustomSafeAreaInsets();
  const dispatch = useAppDispatch();
  const profileResponse = useAppSelector((state) => state.authentication.profile);
  const { requestGET, response: unreadResponse } = useAxios<{ unread: number }>(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
  const { requestGET: getProvider, response: provider } = useAxios<{ name: string; city: string; location: string; logo_url: string }>(API_ENDPOINTS.GET_PROFILE_PROVIDER);

  useEffect(() => {
    dispatch(getProfileDetails());
    requestGET();
    getProvider();
  }, []);

  const unreadCount = unreadResponse?.unread ?? 0;
  const place = [provider?.location, provider?.city].filter(Boolean).join(', ');

  return (
    <View className="bg-primary px-[16px] pb-[20px] rounded-b-[20px]" style={{ paddingTop: top }}>
      <View className="flex-row items-end justify-between">
        <View className="flex-1 pr-[12px]">
          <Text className="text-[22px] text-white font-bold" numberOfLines={1}>
            Hey! {profileResponse?.name || provider?.name || 'there'} 👋
          </Text>
          {place ? (
            <View className="flex-row items-center gap-x-[4px] mt-[4px]">
              <Feather name="map-pin" size={13} color="#FFFFFF" />
              <Text className="text-[14px] text-white/90 flex-1" numberOfLines={1}>{place}</Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row items-center gap-x-[18px] pb-[2px]">
          <Pressable onPress={() => router.push('/notifications' as RelativePathString)} className="relative">
            <FontAwesome name="bell" size={22} color="white" />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-[16px] items-center justify-center px-[4px]">
                <Text className="text-white text-[10px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </Pressable>

          <Pressable onPress={() => router.push('/profile')}>
            <Image
              source={provider?.logo_url ? { uri: provider.logo_url } : Images.profileIcon}
              className="w-[38px] h-[38px] rounded-full border-2 border-white/70"
            />
          </Pressable>
        </View>
      </View>
    </View>
  )
}

/**
 * The header every pushed screen uses: a back chevron, a title, and optionally
 * something on the right (a status chip, usually). No band — pushed screens sit
 * directly on the page background.
 */
export const ScreenHeader = ({ title, right, backButtonRoute }: {
  title: string
  right?: React.ReactNode
  backButtonRoute?: string
}) => {
  const { top } = useCustomSafeAreaInsets();
  return (
    <View className='flex-row items-center justify-between bg-page px-[16px] pb-[12px]' style={{ paddingTop: top }}>
      <View className='flex-row items-center gap-x-[12px] flex-1 pr-[12px]'>
        <TouchableOpacity
          hitSlop={12}
          onPress={() => backButtonRoute ? router.push(backButtonRoute as RelativePathString) : router.back()}
        >
          <Entypo name="chevron-thin-left" size={20} color={Colors.primaryTextColor} />
        </TouchableOpacity>
        <ThemedText size='heading' className='font-bold flex-1' numberOfLines={1}>{title}</ThemedText>
      </View>
      {right}
    </View>
  )
}

export const HeaderWithBackButton = ({ routeName, backButtonRoute }: { routeName: string, backButtonRoute?: string }) => (
  <ScreenHeader title={routeName} backButtonRoute={backButtonRoute} />
)

export const HeaderLeftStandard = ({ routeName, backButtonRoute, showBackButton = true }: { routeName: string, backButtonRoute?: string, showBackButton?: boolean }) => (
  <View className='flex-row items-center gap-x-[12px]'>
    {showBackButton && (
      <TouchableOpacity hitSlop={12} onPress={() => backButtonRoute ? router.push(backButtonRoute as RelativePathString) : router.back()}>
        <Entypo name="chevron-thin-left" size={20} color={Colors.primaryTextColor} />
      </TouchableOpacity>
    )}
    <ThemedText size='heading' className='font-bold'>{routeName}</ThemedText>
  </View>
)
