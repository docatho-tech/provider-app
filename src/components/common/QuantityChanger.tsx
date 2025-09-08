import useDebounce from '@/hooks/useDebounce';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const QuantityChanger = ({ quantity, onChange }: { quantity: number, onChange: (quantity: number) => void }) => {
    const [count, setCount] = useState(quantity);
    const debounce = useDebounce();

    // Sync internal state with prop changes
    useEffect(() => {
        setCount(quantity);
    }, [quantity]);

    const handleDecrement = () => {
        if(count > 1) {
            setCount((prev) => prev - 1);

            debounce(() => {
                onChange(count - 1);
            }, 1000);
        }
    }

    const handleIncrement = () => {
        setCount((prev) => prev + 1);

        debounce(() => {
            onChange(count + 1);
        }, 1000);
    }

    return (
        <View className='flex-row items-center justify-between gap-2 border border-[#AFABAB] rounded-[4px] px-2'>
            <Pressable onPress={handleDecrement}>
                <Text className='text-primaryText text-[18px] font-normal'>-</Text>
            </Pressable>
            <Text className='text-[14px] text-primary font-bold'>{count}</Text>
            <Pressable onPress={handleIncrement}>
                <Text className='text-primaryText text-[18px] font-normal'>+</Text>
            </Pressable>
        </View>
    )
}

export default QuantityChanger

const styles = StyleSheet.create({})