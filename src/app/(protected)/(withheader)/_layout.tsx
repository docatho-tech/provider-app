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
            header: () => <HeaderLeftStandard routeName="Order Details" />
          }}
        />
      </Stack>
    </View>
  )
}

export default WithHeaderLayout