import { API_ENDPOINTS } from "@/constants/APIEndpoints";
import { STORAGE_KEYS } from "@/constants/base";
import { fetchImageFromUri } from "@/utils/base";
import StorageService from "@/utils/storage";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import Toast from "react-native-toast-message";

const useFileUpload = (mediaTypes: string[] = ['images']) => {
  const [file, setFile] = useState<ImagePicker.ImagePickerResult | null>(null);
  const [fileURL, setFileURL] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    try {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypes as ImagePicker.MediaType[],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      setFile(result);

      if (result && result.assets) {
        setFileURL(result.assets[0].uri);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Could not open your photo library' });
    }
  };

  const getFile = async () => {
    if (!file || !file.assets) return;
    return fetchImageFromUri(file.assets[0].uri, file.assets[0].fileName as string);
  }

  /**
   * Pick a document and put it on the server, answering with its URL.
   *
   * A document picker rather than the image picker: a lab report is usually a
   * PDF, and `launchImageLibraryAsync` cannot see one. Returns null on cancel
   * or failure so the caller can tell "user changed their mind" from "here is
   * the address" without a second flag.
   */
  const pickAndUpload = async (): Promise<string | null> => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (picked.canceled || !picked.assets?.length) return null;

    const asset = picked.assets[0];
    const body = new FormData();
    // React Native's FormData takes this shape rather than a File — it streams
    // straight from the local URI instead of reading the whole file into JS.
    body.append('file', {
      uri: asset.uri,
      name: asset.name || 'report.pdf',
      type: asset.mimeType || 'application/pdf',
    } as unknown as Blob);

    setIsUploading(true);
    try {
      const token = await StorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${API_ENDPOINTS.UPLOADS}`, {
        method: 'POST',
        // `Token`, not `Bearer` — the same scheme `useAxios` sends. Getting
        // this wrong answers 401 on an upload that is otherwise correct.
        headers: token ? { Authorization: `Token ${token}` } : undefined,
        body,
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        Toast.show({ type: 'error', text1: detail?.detail || 'Upload failed' });
        return null;
      }
      const data = await response.json();
      return data.url ?? null;
    } catch {
      Toast.show({ type: 'error', text1: 'Upload failed. Check your connection.' });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { file, handleUpload, getFile, fileURL, setFileURL, pickAndUpload, isUploading };
};

export default useFileUpload;
