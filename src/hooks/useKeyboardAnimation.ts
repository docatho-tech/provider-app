import { Platform } from 'react-native';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { useSharedValue } from 'react-native-reanimated';

const PADDING_BOTTOM = Platform.OS === 'ios' ? 20 : 0;

const useKeyboardAnimation = () => {
  const height = useSharedValue(0);

  useKeyboardHandler(
    {
      onMove: event => {
        'worklet';
        height.value = Math.max(event.height, PADDING_BOTTOM);
      },
    },
    []
  );
  return { height, PADDING_BOTTOM };
};

export default useKeyboardAnimation;