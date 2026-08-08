import HomeIcon from '@/components/icons/Home'
import OrdersIcon from '@/components/icons/Orders'
import ProfileIcon from '@/components/icons/Profile'
import { HomeHeader } from '@/components/layout/Headers'
import { Colors } from '@/constants/Colors'
import { useProviderType } from '@/hooks/useProviderType'
import { Tabs } from 'expo-router'
import React from 'react'

const TabsLayout = () => {
  const { isDoctor, isChemist, isLoading } = useProviderType();
  if (isLoading) return null;

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: Colors.primary, tabBarInactiveTintColor: "#313131", tabBarLabelStyle: { fontWeight: '400', fontSize: 13 }, headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => (<HomeIcon color={color} />), header: () => <HomeHeader name="Docatho Partner" /> }} />
      <Tabs.Screen name="appointments" options={{ title: 'Appointments', href: isDoctor ? undefined : null, tabBarIcon: ({ color }) => (<OrdersIcon color={color} />), header: () => <HomeHeader name="Appointments" /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', href: isChemist ? undefined : null, tabBarIcon: ({ color }) => (<OrdersIcon color={color} />), header: () => <HomeHeader name="Orders" /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({focused, color }) => (<ProfileIcon color={color} type={focused ? "solid" : "outline"} />), header: () => <HomeHeader name="Profile" /> }} />
    </Tabs>
  )
}
export default TabsLayout
