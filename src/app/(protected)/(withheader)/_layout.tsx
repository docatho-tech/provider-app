import { ScreenHeader } from '@/components/layout/Headers'
import { Colors } from '@/constants/Colors'
import { Stack } from 'expo-router'
import React from 'react'
import { View } from 'react-native'

/**
 * Static titles live here; the detail screens render their own header.
 *
 * A patient's name, an order number and its status chip are all things the
 * screen has to fetch before it can draw them, so a header declared up here
 * could only show a placeholder and then swap — which is why those screens set
 * `headerShown: false` and draw `ScreenHeader` themselves.
 */
const WithHeaderLayout = () => (
  <View style={{ flex: 1, backgroundColor: Colors.page }}>
    <Stack screenOptions={{ contentStyle: { backgroundColor: Colors.page } }}>
      <Stack.Screen name="orders/[orderId]" options={{ headerShown: false }} />
      <Stack.Screen name="appointments/[appointmentId]" options={{ headerShown: false }} />
      <Stack.Screen name="bookings/[bookingId]" options={{ headerShown: false }} />
      <Stack.Screen
        name="doctor/profile"
        options={{ headerShown: true, header: () => <ScreenHeader title="Practice Profile" backButtonRoute="/profile" /> }}
      />
      <Stack.Screen
        name="doctor/availability"
        options={{ headerShown: true, header: () => <ScreenHeader title="Availability" backButtonRoute="/doctor/profile" /> }}
      />
      {/* Earnings and the catalog draw their own headers: one titles itself
          "My Earnings" over three different layouts, the other is "Tests
          Catalog" or "Medicines Catalog" depending on who is signed in, and
          neither title is known before the fetch. */}
      <Stack.Screen name="earnings" options={{ headerShown: false }} />
      <Stack.Screen name="catalog" options={{ headerShown: false }} />
      <Stack.Screen
        name="insights"
        options={{ headerShown: true, header: () => <ScreenHeader title="Insights" backButtonRoute="/earnings" /> }}
      />
      <Stack.Screen
        name="bank"
        options={{ headerShown: true, header: () => <ScreenHeader title="Bank & Payout" backButtonRoute="/profile" /> }}
      />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: true, header: () => <ScreenHeader title="Notifications" backButtonRoute="/" /> }}
      />
      <Stack.Screen name="appointments/[appointmentId]/prescription" options={{ headerShown: false }} />
      <Stack.Screen
        name="appointments/[appointmentId]/video"
        options={{ headerShown: true, header: () => <ScreenHeader title="Video Consultation" backButtonRoute="/appointments" /> }}
      />
    </Stack>
  </View>
)

export default WithHeaderLayout
