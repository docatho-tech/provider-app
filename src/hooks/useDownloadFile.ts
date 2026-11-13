import { STORAGE_KEYS } from "@/constants/base";
import AsyncStorageService from "@/utils/storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Linking } from "react-native";
import Toast from "react-native-toast-message";

interface DownloadArgs {
  endpoint: string;
  fileName: string;
  mimeType: string;
  params?: Record<string, string | number | undefined>;
  dialogTitle?: string;
  UTI?: string;
}

/**
 * Fetches a file the API only serves to an authenticated partner, then hands it
 * to the OS share/open sheet.
 *
 * The endpoints are protected by an `Authorization: Token <token>` header and
 * not a cookie, so the URL cannot simply be opened — the file is downloaded
 * with the header attached and saved to the cache directory first.
 */
const useDownloadFile = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadFile = async ({
    endpoint,
    fileName,
    mimeType,
    params,
    dialogTitle,
    UTI,
  }: DownloadArgs) => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const token = await AsyncStorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        throw new Error("You are not signed in.");
      }

      const query = Object.entries(params ?? {})
        .filter(([, value]) => value !== undefined && value !== "")
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join("&");
      const url = `${process.env.EXPO_PUBLIC_API_URL}${endpoint}${query ? `?${query}` : ""}`;

      const { uri, status } = await FileSystem.downloadAsync(
        url,
        `${FileSystem.cacheDirectory}${fileName}`,
        { headers: { Authorization: `Token ${token}` } }
      );

      if (status !== 200) {
        throw new Error("Unable to download the file. Please try again.");
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType, dialogTitle, UTI });
      } else {
        await Linking.openURL(uri);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to download the file.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadFile, isDownloading };
};

export default useDownloadFile;
