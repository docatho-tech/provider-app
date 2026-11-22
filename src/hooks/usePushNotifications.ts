import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";

import { Platform } from "react-native";

export type NotificationData = Record<string, unknown>;

/** What to do when the user taps a notification — routing lives in the app. */
export type NotificationTapHandler = (data: NotificationData) => void;

export interface PushNotificationState {
  pushToken?: Notifications.ExpoPushToken;
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

export const usePushNotifications = (
  onTap?: NotificationTapHandler
): PushNotificationState => {
  const [pushToken, setPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >();

  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  /** Keeps the latest handler without re-registering the listeners. */
  const onTapRef = useRef<NotificationTapHandler | undefined>(onTap);
  /**
   * A cold start delivers the same response twice: once from
   * getLastNotificationResponseAsync and once from the listener. Handle each
   * notification once.
   */
  const handled = useRef<Set<string>>(new Set());

  onTapRef.current = onTap;

  useEffect(() => {
    const handleResponse = (
      response: Notifications.NotificationResponse | null
    ) => {
      if (!response) {
        return;
      }
      const id = response.notification.request.identifier;
      if (handled.current.has(id)) {
        return;
      }
      handled.current.add(id);
      onTapRef.current?.(
        (response.notification.request.content.data ?? {}) as NotificationData
      );
    };

    registerForPushNotificationsAsync().then((token) => {
      setPushToken(token);
    });

    // The tap that launched the app from a killed state.
    Notifications.getLastNotificationResponseAsync().then(handleResponse);

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(handleResponse);

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

    if (!Device.isDevice) {
      console.log("Must be using a physical device for Push notifications");
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification");
      return;
    }

    // The backend sends through Expo's gateway, which rejects raw FCM/APNs
    // tokens — this has to be the Expo token, and it needs the EAS project id.
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.log("No EAS projectId — cannot mint an Expo push token");
      return;
    }

    try {
      return await Notifications.getExpoPushTokenAsync({ projectId });
    } catch (error) {
      console.log(error, "error getting expo push token");
    }
  };

  return {
    pushToken,
    notification,
  };
};
