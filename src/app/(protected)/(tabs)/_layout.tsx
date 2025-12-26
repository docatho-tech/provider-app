
import HomeIcon from '@/components/icons/Home'
import OrdersIcon from '@/components/icons/Orders'
import ProfileIcon from '@/components/icons/Profile'
import { HomeHeader } from '@/components/layout/Headers'
import { Colors } from '@/constants/Colors'
import { Tabs, usePathname } from 'expo-router'
import React from 'react'

const TabsLayout = () => {
  const pathname = usePathname();
  const isInMedicines = pathname?.includes('medicines');

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: "#313131",
      tabBarLabelStyle: {
        fontWeight: '400',
        fontSize: 13
      },
      tabBarStyle: isInMedicines ? { display: 'none' } : undefined,
      headerShown: isInMedicines ? false : true,
    }}>
      <Tabs.Screen 
        name="index"  
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <HomeIcon color={color} />
          ),
          header: () => <HomeHeader name="Yuvant" />
        }}
      />
      <Tabs.Screen 
        name="orders"  
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <OrdersIcon color={color} />
          ),
          header: () => <HomeHeader name="Yuvant" />
        }}
      />
      <Tabs.Screen 
        name="profile"  
        options={{
          title: 'Profile',
          tabBarIcon: ({focused, color, size }) => (
            <ProfileIcon color={color} type={focused ? "solid" : "outline"} />
          ),
          header: () => <HomeHeader name="Yuvant" />
        }}
      />
    </Tabs>
  )
}

export default TabsLayout