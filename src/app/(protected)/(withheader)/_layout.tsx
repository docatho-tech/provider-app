import { HeaderLeftStandard } from '@/components/layout/Headers'
import { Stack } from 'expo-router'
import React from 'react'
import { View } from 'react-native'

const WithHeaderLayout = () => {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack>
        <Stack.Screen
          name="orders/[orderId]"
          options={{
            headerShown: true,
            header: () => <HeaderLeftStandard routeName="Order Details" backButtonRoute="/" />
          }}
        />
        <Stack.Screen
          name="doctor/profile"
          options={{
            headerShown: true,
            header: () => <HeaderLeftStandard routeName="Practice Profile" backButtonRoute="/profile" />
          }}
        />
        <Stack.Screen
          name="doctor/availability"
          options={{
            headerShown: true,
            header: () => <HeaderLeftStandard routeName="Availability" backButtonRoute="/doctor/profile" />
          }}
        />
        <Stack.Screen
          name="earnings"
          options={{
            headerShown: true,
            header: () => <HeaderLeftStandard routeName="Earnings" backButtonRoute="/profile" />
          }}
        />
        <Stack.Screen
          name="bank"
          options={{
            headerShown: true,
            header: () => <HeaderLeftStandard routeName="Bank & Payout" backButtonRoute="/profile" />
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: true,
            header: () => <HeaderLeftStandard routeName="Notifications" backButtonRoute="/" />
          }}
        />
        <Stack.Screen
          name="appointments/[appointmentId]"
          options={{
            headerShown: true,
            header: () => <HeaderLeftStandard routeName="Patient Details" backButtonRoute="/appointments" />
          }}
        />
        <Stack.Screen
          name="appointments/[appointmentId]/video"
          options={{
            headerShown: true,
            header: () => <HeaderLeftStandard routeName="Video Consultation" backButtonRoute="/appointments" />
          }}
        />
      </Stack>
    </View>
  )
}

export default WithHeaderLayout
