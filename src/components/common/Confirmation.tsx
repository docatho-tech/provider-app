import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Modal from '../general/Modal';
import ThemedText from './ThemedText';

interface iConfirmationProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const Confirmation = ({ open, onClose, title, description, onConfirm, onCancel }: iConfirmationProps) => {
  const handleOnConfirm = () => {
    onConfirm();
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose}>
      <View>
        <ThemedText size='heading'>{title || 'Confirmation'}</ThemedText>
        <ThemedText size='subheading' className='mt-[10px] mb-[20px]'>{description || 'Are you sure you want to confirm this action?'}</ThemedText>
        <View className='flex-row items-center justify-between'>
          <Pressable className='bg-white rounded-[10px] p-[10px] border border-primary w-[48%] items-center justify-center' onPress={onCancel}>
            <ThemedText size='subheading' className='text-primary'>Cancel</ThemedText>
          </Pressable>
          
          <Pressable className='bg-primary rounded-[10px] p-[10px] w-[48%] items-center justify-center' onPress={handleOnConfirm}>
            <ThemedText size='subheading' className='text-white'>Confirm</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

export default Confirmation

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    width: '48%',
  },
});