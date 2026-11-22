import BrandMark from '@/components/icons/Brand'
import ProfileIcon from '@/components/icons/Profile'
import { HomeHeader } from '@/components/layout/Headers'
import { Colors } from '@/constants/Colors'
import { useProviderType } from '@/hooks/useProviderType'
import Feather from '@expo/vector-icons/Feather'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Tabs } from 'expo-router'
import React from 'react'

/**
 * One tab bar per persona.
 *
 * Every persona's second and third tabs differ — a doctor has Appointments and
 * a Catalog, a centre has Bookings and Earnings, a pharmacy has Orders and
 * Earnings — so each route declares itself with `href: null` when it does not
 * belong to the signed-in partner. Hiding rather than branching keeps one
 * router tree, which is what the deep links from notifications resolve against.
 */
const TabsLayout = () => {
  const { isDoctor, isLab, isChemist, isLoading } = useProviderType();
  if (isLoading) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.primaryTextColor,
        tabBarLabelStyle: { fontWeight: '500', fontSize: 12 },
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: Colors.cardBorder, height: 88, paddingTop: 8 },
        sceneStyle: { backgroundColor: Colors.page },
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <BrandMark color={color} size={24} />,
          header: () => <HomeHeader />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          href: isDoctor ? undefined : null,
          tabBarIcon: ({ color }) => <Feather name="calendar" size={22} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catalog',
          href: isDoctor ? undefined : null,
          tabBarIcon: ({ color }) => <Feather name="list" size={22} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          href: isLab ? undefined : null,
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="microscope" size={22} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          href: isChemist ? undefined : null,
          tabBarIcon: ({ color }) => <Feather name="shopping-bag" size={22} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          href: isDoctor ? null : undefined,
          tabBarIcon: ({ color }) => <Feather name="credit-card" size={22} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => <ProfileIcon color={color} type={focused ? "solid" : "outline"} />,
          headerShown: false,
        }}
      />
    </Tabs>
  )
}

export default TabsLayout
