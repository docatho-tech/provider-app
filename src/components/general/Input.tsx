import React from 'react'
import { KeyboardTypeOptions, Pressable, TextInput, View } from 'react-native'
import ThemedText from '../common/ThemedText'


export interface InputProps {
  label?: string,
  value: string | number | null,
  placeholder?: string,
  onChange?: (text: string) => void,
  inputClassName?: string,
  labelClassName?: string,
  containerClassName?: string,
  error?: string,
  keyboardType?: KeyboardTypeOptions,
  editable?: boolean,
  maxLength?: number,
  onFocus?: (e: any) => void,
  onPress?: (e: any) => void,
  startAdornment?: React.ReactNode,
  endAdornment?: React.ReactNode,
}

const Input = ({ label, value, placeholder, onChange, inputClassName, labelClassName, error, keyboardType, maxLength, containerClassName, onFocus, onPress, editable = true, startAdornment, endAdornment }: InputProps) => {
  // Check if height exceeds 50px from className (h-[...] pattern)
  const checkHeightExceeds50 = (className?: string): boolean => {
    if (!className) return false
    
    // Match h-[number]px pattern
    const heightMatch = className.match(/h-\[(\d+)px?\]/i)
    if (heightMatch) {
      const height = parseInt(heightMatch[1], 10)
      return height >= 100
    }
    
    // Also check for h-[number] pattern (without px)
    const heightMatch2 = className.match(/h-\[(\d+)\]/i)
    if (heightMatch2) {
      const height = parseInt(heightMatch2[1], 10)
      return height >= 100
    }
    
    return false
  }

  const shouldAlignTop = checkHeightExceeds50(inputClassName)

  return (
    <View className={`${containerClassName}`}>
      {
        label && <ThemedText aria-label="Label for Username" nativeID="labelUsername" className={`${labelClassName} mb-[5px]`}> {label} </ThemedText>
      }

      <View className={`flex-row items-center justify-start gap-x-[5px] ${startAdornment || endAdornment ? inputClassName : ''}`}>
        {startAdornment && <View className='mb-[5px]'>{startAdornment}</View>}
        {editable === false && onPress ? (
          <Pressable
            onPress={onPress}
            className="flex-1"
          >
            <TextInput
              className={`${(startAdornment || endAdornment) ? '' : inputClassName} placeholder:text-[#838383] flex-1`}
              aria-label="input"
              aria-labelledby="labelUsername"
              placeholder={placeholder}
              value={value?.toString()}
              onChangeText={onChange}
              keyboardType={keyboardType || 'default'}
              maxLength={maxLength || undefined}
              editable={editable}
              onFocus={onFocus}
              pointerEvents="none"
              textAlignVertical={shouldAlignTop ? "top" : undefined}
            />
          </Pressable>
        ) : (
          <TextInput
            className={`${(startAdornment || endAdornment) ? '' : inputClassName} placeholder:text-[#838383] flex-1`}
            aria-label="input"
            aria-labelledby="labelUsername"
            placeholder={placeholder}
            value={value?.toString()}
            onChangeText={onChange}
            keyboardType={keyboardType || 'default'}
            maxLength={maxLength || undefined}
            editable={editable}
            onFocus={onFocus}
            textAlignVertical={shouldAlignTop ? "top" : undefined}
          />
        )}
        {endAdornment && endAdornment}
      </View>
      {error && <ThemedText className='text-red-500 text-[0.8rem] mt-[5px]'> {error} </ThemedText>}
    </View>
  )
}

export default Input