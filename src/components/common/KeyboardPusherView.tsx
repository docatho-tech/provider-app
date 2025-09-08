import useKeyboardAnimation from '@/hooks/useKeyboardAnimation';
import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';


const KeyboardPusherView = () => {
  const { height, PADDING_BOTTOM } = useKeyboardAnimation();

  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
      marginBottom: height.value > 0 ? -30 : PADDING_BOTTOM
    };
  }, [height]);

  return <Animated.View style={fakeView} />
}

export default KeyboardPusherView