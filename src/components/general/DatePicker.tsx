import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CommunityDateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import PrimaryButton from '../common/PrimaryButton';
import BottomSheet from './BottomSheet';

interface iDatePickerProps {
  show: boolean,
  date: Date,
  onChange: (date: Date) => void,
  onSave: () => void,
  onClose: () => void,
}

const DatePicker = ({ show, date, onChange, onSave, onClose }: iDatePickerProps) => {
  const datepickerBottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (show) {
      datepickerBottomSheetRef.current?.present();
    }
  }, [show])

  const handleSave = () => {
    onSave();
    datepickerBottomSheetRef.current?.close();
  }

  return (
    Platform.OS === 'ios' ? (
      <BottomSheet ref={datepickerBottomSheetRef} onDismiss={onClose}>
        <View className='flex-1 px-[20px]'>
          <CommunityDateTimePicker
            textColor='black'
            value={date}
            mode={'date'}
            is24Hour={true}
            onChange={(event, selectedDate) => {
              onChange(selectedDate || new Date())
            }}
            display="spinner"
            style={{ backgroundColor: 'white', width: '100%', marginHorizontal: 'auto' }}
          />
          <PrimaryButton title='Save' className='mb-[40px]' onPress={handleSave} />
        </View>
      </BottomSheet>
    )
    :
    (
      (Platform.OS === 'android' && show) && (
        <CommunityDateTimePicker
          value={date}
          mode="date"
          is24Hour={true}
          onChange={(event, selectedDate) => {
            onChange(selectedDate || new Date())
            handleSave()
            onClose()
          }}
          display="spinner"
        />
      )
    )
  )
}

export default DatePicker