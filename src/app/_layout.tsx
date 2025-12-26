import Fonts from '@/constants/Fonts';
import AuthProvider from '@/contexts/authenticationContext';
import { LoadingProvider } from '@/contexts/loadingContext';
import { ToastProvider } from '@/contexts/toastProvider';
import { store } from "@/store/store";
import "@/styles/global.css";
import {
  BottomSheetModalProvider
} from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Provider } from "react-redux";

export default function RootLayout() {
  let [fontsLoaded] = useFonts({...Fonts});

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <Provider store={store}>
            <ToastProvider>
              <LoadingProvider>
                <AuthProvider>
                  <Stack>
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen name="otp" options={{ headerShown: false }} />
                    <Stack.Screen name="(protected)" options={{ headerShown: false }} />
                  </Stack>
                  <StatusBar style={'light'} />
                </AuthProvider>
              </LoadingProvider>
            </ToastProvider>
          </Provider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
}
