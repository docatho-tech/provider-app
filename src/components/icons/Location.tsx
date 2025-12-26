import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import React from 'react';

const Location = ({ size = 24, color = 'black' }: { size?: number, color?: string }) => {
  return (
    <FontAwesome6 name="location-dot" size={size} color={color} />
  )
}

export default Location