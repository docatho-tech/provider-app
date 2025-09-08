import { fetchImageFromUri } from "@/utils/base";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

const useFileUpload = (mediaTypes: string[]) => {
  const [file, setFile] = useState<ImagePicker.ImagePickerResult | null>(null);
  const [fileURL, setFileURL] = useState<string>('');
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

      if(result && result.assets) {
        setFileURL(result.assets[0].uri);
      }
    } catch (err: unknown) {
      // see error handling
    }
  };

  const getFile = async () => {
    if (!file || !file.assets) return;
    const fileBlob = await fetchImageFromUri(file.assets[0].uri, file.assets[0].fileName as string);
    return fileBlob;
  }

  return {
    file, handleUpload, getFile, fileURL, setFileURL
  }
};

export default useFileUpload;
