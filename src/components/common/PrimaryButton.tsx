import React from 'react'
import { ActivityIndicator, TouchableOpacity } from 'react-native'
import ThemedText from './ThemedText'

interface PrimaryButtonProps {
  onPress?: () => void
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  title: string
  className?: string
  loading?: boolean
  disabled?: boolean
}

const PrimaryButton = ({ title, startIcon, endIcon, onPress = undefined, className = '', loading = false, disabled = false }: PrimaryButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress ? onPress : undefined}
      className={`w-full bg-primary text-white flex font-extralight justify-center items-center h-[40px] rounded-default flex-row gap-3 ${className} ${disabled ? 'opacity-50' : ''}`}
      disabled={disabled}
    >
      {startIcon && startIcon}
      <ThemedText size='standard' className='font-semibold text-white ml-2'>{title}</ThemedText>
      {endIcon && endIcon}
      {loading && <ActivityIndicator color={'white'} animating={loading} />}
    </TouchableOpacity>
  )
}

export default PrimaryButton