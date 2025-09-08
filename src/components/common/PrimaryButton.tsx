import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native'

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
            className={`w-full bg-primary text-white flex justify-center items-center h-[50px] rounded-[8px] mt-[20px] flex-row gap-3 ${className} ${disabled ? 'opacity-50' : ''}`}
            disabled={disabled}
        >
            {startIcon && startIcon}
            <Text className='text-white text-[18px] font-semibold ml-2'>{title}</Text>
            {endIcon && endIcon}
            {loading && <ActivityIndicator color={'white'} animating={loading} />}
        </TouchableOpacity>
    )
}

export default PrimaryButton