import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';

const Delete = ({ size = 24, color = 'black' }: { size?: number, color?: string }) => {
  return (
    <FontAwesome name="trash-o" size={size} color={color} />
  )
}

export default Delete