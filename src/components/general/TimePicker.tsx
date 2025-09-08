import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CommunityDateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import PrimaryButton from '../common/PrimaryButton';
import BottomSheet from './BottomSheet';

interface iTimePickerProps {
  show: boolean,
  time: Date,
  onClose: () => void,
  onChange: (time: Date) => void,
  onSave: () => void,
}

const TimePicker = ({ show, time, onChange, onSave, onClose }: iTimePickerProps) => {
  const timepickerBottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (show) {
      timepickerBottomSheetRef.current?.present();
    }
  }, [show])

  const handleSave = () => {
    onSave();
    timepickerBottomSheetRef.current?.close();
  }

  return (
    Platform.OS === 'ios' ? (
      <BottomSheet ref={timepickerBottomSheetRef} onDismiss={onClose}>
        <View className='flex-1 px-[20px]'>
          <CommunityDateTimePicker
            textColor='black'
            value={time}
            mode={'time'}
            is24Hour={false}
            onChange={(event, selectedTime) => {
              onChange(selectedTime || new Date())
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
          value={time}
          mode="time"
          is24Hour={true}
          onChange={(event, selectedTime) => {
            onChange(selectedTime || new Date())
            onClose()
          }}
          display="spinner"
        />
      )
    )
  )
}

export default TimePicker