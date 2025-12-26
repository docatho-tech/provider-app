import React from 'react'
import { Text, TextProps } from 'react-native'

interface ThemedTextProps extends Omit<TextProps, 'className'> {
  children: React.ReactNode
  className?: string
  color?: 'primaryTextColor' | 'secondaryTextColor'
  size?: 'largeHeading' | 'heading' | 'subheading' | 'standard' | 'small'
  textType?: 'primary' | 'secondary'
}

const ThemedText = ({ children, className = '', size = 'standard', textType = 'primary', ...props }: ThemedTextProps) => {

  const getTextSize = () => {
    switch (size) {
      case 'largeHeading':
        return 'text-[24px] font-bold'
      case 'heading':
        return 'text-[22px] font-bold'
      case 'subheading':
        return 'text-[18px]'
      case 'standard':
        return 'text-[14px]'
      case 'small':
        return 'text-[13px]'
      default:
        return 'text-[16px]'
    }
  }

  const getTextColor = () => {
    // Check if className already contains a text color class
    const hasColorClass = /text-(white|black|primary|secondary|primaryTextColor|secondaryTextColor|lightTextColor|\[#[0-9A-Fa-f]{3,8}\]|\[rgb\([^)]+\)\]|\[rgba\([^)]+\)\])/i.test(className);    

    if (hasColorClass) {
      return ''; // Don't add default color if one is already specified
    }

    switch (textType) {
      case 'primary':
        return 'text-primaryTextColor'
      case 'secondary':
        return 'text-secondaryTextColor'
      default:
        return 'text-primaryTextColor' // Use primaryTextColor instead of non-existent defaultTextColor
    }
  }


  return (
    <Text
      {...props}
      className={`${getTextSize()} ${getTextColor()} ${className}`}
    >
      {children}
    </Text>
  )
}

export default ThemedText