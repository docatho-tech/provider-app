import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const SpinnerLoader = () => {
  const spinValue = useRef(new Animated.Value(0)).current
  
  // Spinning animation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    startSpinning();
  }, []);

  const startSpinning = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start()
  }

  return (
    <View className="items-center justify-center">
      {/* Outer ring */}
      <Animated.View
        className="w-30 h-30 rounded-full border-3 border-yellow-500 border-t-transparent border-r-transparent absolute"
        style={{ transform: [{ rotate: spin }] }}
      />

      {/* Inner ring */}
      <Animated.View
        className="w-20 h-20 rounded-full border-2 border-yellow-200 border-b-transparent border-l-transparent absolute"
        style={{ transform: [{ rotate: spin }] }}
      />

      {/* Center dot */}
      <View className="w-5 h-5 rounded-full bg-yellow-500 mt-12" />

      {/* Loading text */}
      <Text className="mt-10 text-base text-gray-900 font-medium">
        Please wait while we process your wallet...
      </Text>
    </View> 
  )
}

export default SpinnerLoader

const styles = StyleSheet.create({})