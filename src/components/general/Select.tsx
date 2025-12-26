import useCustomSafeAreaInsets from '@/hooks/useCustomSafeAreaInsets';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useRef } from 'react';
import { FlatList, Platform, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../common/PrimaryButton';
import BottomSheet from './BottomSheet';

interface iSelectProps {
  show: boolean,
  onClose: () => void,
  onSave: () => void,
  selectedValue: string,
  onValueChange: (item: { label: string, value: string }) => void,
  items: { label: string, value: string }[],
}


const Select = ({ show, selectedValue, onValueChange, items, onSave, onClose }: iSelectProps) => {
  const selectBottomSheetRef = useRef<BottomSheetModal>(null);
  const { bottom } = useCustomSafeAreaInsets();

  useEffect(() => {
    if (show) {
      selectBottomSheetRef.current?.present();
    } else {
      selectBottomSheetRef.current?.close();
    }
  }, [show])

  const handleSave = () => {
    onSave();
    selectBottomSheetRef.current?.close();
  }

  const handleItemSelect = (item: { label: string, value: string }) => {
    onValueChange(item);
    if (Platform.OS === 'android') {
      // On Android, auto-save when item is selected
      onSave();
      selectBottomSheetRef.current?.close();
    }
  }

  const renderAndroidItem = ({ item }: { item: { label: string, value: string } }) => {
    const isSelected = item.value === selectedValue;
    return (
      <TouchableOpacity
        onPress={() => handleItemSelect(item)}
        className={`py-4 px-5 border-b border-gray-200 ${isSelected ? 'bg-blue-50' : 'bg-white'}`}
      >
        <Text className={`text-base ${isSelected ? 'text-blue-600 font-semibold' : 'text-gray-900'}`}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleIOSValueChange = (itemValue: string) => {
    const selectedItem = items.find((item) => item.value === itemValue);
    if (selectedItem) {
      onValueChange(selectedItem);
    }
  }

  return (
    Platform.OS === 'ios' ? (
      <BottomSheet ref={selectBottomSheetRef} onDismiss={onClose}>
        <View className='flex-1 px-[20px]'>
          <Picker
            selectedValue={selectedValue}
            onValueChange={handleIOSValueChange}>
            {items.map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
          <PrimaryButton title='Save' onPress={handleSave} className={`mb-[50px]`} />
        </View>
      </BottomSheet>
    )
      :
      (
        <BottomSheet ref={selectBottomSheetRef} onDismiss={onClose}>
          <View className='flex-1'>
            <FlatList
              data={items}
              renderItem={renderAndroidItem}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={<View style={{ height: bottom }} />}
            />
          </View>
        </BottomSheet>
      )
  )
}

export default Select