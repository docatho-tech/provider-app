import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";

import { Platform } from "react-native";

export interface PushNotificationState {
  pushToken?: Notifications.DevicePushToken;
  notification?: Notifications.Notification;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotifications = (): PushNotificationState => {
  const [pushToken, setPushToken] = useState<
    Notifications.DevicePushToken | undefined
  >();

  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log(existingStatus, 'existingStatus');
      
      let finalStatus = existingStatus;

      console.log(finalStatus, 'finalStatus');
      

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.log('Failed to get push token for push notification');
        return;
      }
      
      try {
        token = await Notifications.getDevicePushTokenAsync();
      } catch (error) {
        console.log(error, 'error getting device push token');
      }
      
    } else {
      console.log('Must be using a physical device for Push notifications');
    }    

    return token;
  };

  return {
    pushToken,
    notification,
  };
};
