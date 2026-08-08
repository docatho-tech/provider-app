import { API_ENDPOINTS } from "@/constants/APIEndpoints";
import { STORAGE_KEYS } from "@/constants/base";
import { replaceUrlParams } from "@/utils/base";
import AsyncStorageService from "@/utils/storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Linking } from "react-native";
import Toast from "react-native-toast-message";

/**
 * Downloads the invoice PDF for an order and opens the native share/open sheet.
 *
 * The invoice endpoint is auth-protected via an `Authorization: Token <token>`
 * header (not a cookie), so the file is fetched with the header attached and
 * saved to the cache directory before being handed to the OS.
 */
const useDownloadInvoice = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadInvoice = async (
    orderId: number | string,
    orderNumber?: string
  ) => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const token = await AsyncStorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        throw new Error("You are not signed in.");
      }

      const baseURL = process.env.EXPO_PUBLIC_API_URL;
      const endpoint = replaceUrlParams(API_ENDPOINTS.ORDER_INVOICE, { orderId });
      const url = `${baseURL}${endpoint}`;

      const fileName = `invoice-${orderNumber || orderId}.pdf`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const { uri, status } = await FileSystem.downloadAsync(url, fileUri, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (status !== 200) {
        throw new Error("Unable to download the invoice. Please try again.");
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Invoice",
          UTI: "com.adobe.pdf",
        });
      } else {
        await Linking.openURL(uri);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to download the invoice.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadInvoice, isDownloading };
};

export default useDownloadInvoice;
