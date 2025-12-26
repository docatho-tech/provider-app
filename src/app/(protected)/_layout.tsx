import { AuthContext } from '@/contexts/authenticationContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Redirect, Stack } from 'expo-router';
import { useContext, useEffect } from 'react';

export default function ProtectedRootLayout() {
  const { isLoggedIn, isReady } = useContext(AuthContext);
  const { expoPushToken } = usePushNotifications();
//   const { requestPOST: registerForPushNotifications } = useAxios(API_ENDPOINTS.REGISTER_FOR_PUSH_NOTIFICATIONS);


  useEffect(() => {
    if(isLoggedIn) {
      if(expoPushToken) {
        sendNotificationTokenToServer();
      }
    }
  }, [isLoggedIn, expoPushToken])

  const sendNotificationTokenToServer = () => {
    const payload = {
      token: expoPushToken?.data,
    }
    // registerForPushNotifications(payload);
  }

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
