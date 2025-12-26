import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const useCustomSafeAreaInsets = () => {
  const insets = useSafeAreaInsets();
  const { top, bottom, left, right } = insets;

  return {
    top: Platform.OS === "ios" ? top : top + 20 ,
    bottom: Platform.OS === "ios" ? bottom : bottom + 20,
    left: left,
    right: right,
  };
};

export default useCustomSafeAreaInsets;
