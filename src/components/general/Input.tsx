import React from 'react'
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native'


export interface InputProps {
    label? : string,
    value : string | number | null,
    placeholder? : string,
    onChange? : (text : string) => void,
    inputClassName? : string,
    labelClassName? : string,
    containerClassName? : string,
    error? : string,
    keyboardType? : KeyboardTypeOptions,
    editable? : boolean,
    maxLength? : number,
    onFocus? : (e : any) => void,
    onPress? : (e : any) => void,
}

const Input = ({ label, value, placeholder, onChange, inputClassName, labelClassName, error, keyboardType, maxLength, containerClassName, onFocus, onPress, editable = true }: InputProps) => {
  return (
    <View className={`${containerClassName}`}>
        {
          label && <Text aria-label="Label for Username" nativeID="labelUsername" className={labelClassName}> {label} </Text>
        }
        <TextInput 
            className={`${inputClassName} mt-[5px] placeholder:text-[#838383]`}
            aria-label="input" 
            aria-labelledby="labelUsername" 
            placeholder={placeholder} 
            value={value?.toString()}
            onChangeText={onChange}
            keyboardType={keyboardType || 'default'}
            maxLength={maxLength || undefined}
            editable={editable}
            onFocus={onFocus}
            onPress={onPress}
        />
        {error && <Text className='text-red-500 text-[0.8rem] mt-[5px]'> {error} </Text>}
    </View>
  )
}

export default Input

const styles = StyleSheet.create({})