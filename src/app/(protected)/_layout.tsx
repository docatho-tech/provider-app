import { API_ENDPOINTS } from '@/constants/APIEndpoints';
import { AuthContext } from '@/contexts/authenticationContext';
import useAxios from '@/hooks/useAxios';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Redirect, Stack } from 'expo-router';
import { useCallback, useContext, useEffect } from 'react';
import { Platform } from 'react-native';

export default function ProtectedRootLayout() {
  const { isLoggedIn, isReady } = useContext(AuthContext);
  const { pushToken } = usePushNotifications();
  const { requestPOST: registerDeviceToken } = useAxios(API_ENDPOINTS.DEVICE_TOKEN);

  const sendNotificationTokenToServer = useCallback(async () => {
    if (!pushToken?.data) {
      return;
    }

    const platform =
      Platform.OS === 'android'
        ? 'android'
        : Platform.OS === 'ios'
          ? 'ios'
          : 'web';

    try {
      await registerDeviceToken({
        token: pushToken.data,
        platform,
      });
    } catch (error) {
      console.log('Failed to register device token', error);
    }
  }, [pushToken, registerDeviceToken]);

  useEffect(() => {
    if (isLoggedIn && pushToken) {
      void sendNotificationTokenToServer();
    }
  }, [isLoggedIn, pushToken, sendNotificationTokenToServer]);

  // Show loading screen if not ready
  if(!isReady) {
    return null;
  }

  // Redirect to login if not logged in
  if(!isLoggedIn) {
    return <Redirect href="/login" />
  }

  return (
    <Stack>
      <Stack.Screen name="(headerless)" options={{ headerShown: false }} />
      <Stack.Screen name="(withheader)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
