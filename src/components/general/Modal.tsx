import React from 'react';
import { KeyboardAvoidingView, Platform, Modal as RNModal, TouchableWithoutFeedback, View } from 'react-native';

interface iModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    closeOnBackdropPress?: boolean;
}

const Modal = ({ open, onClose, children, closeOnBackdropPress = true } : iModalProps) => {
    return (
        <RNModal visible={open} onRequestClose={onClose} animationType='slide' transparent={true}> 
            <TouchableWithoutFeedback onPress={closeOnBackdropPress ? onClose : undefined}>
                <View className='flex-1 justify-center items-center'>
                    <View className='absolute top-0 left-0 right-0 bottom-0 bg-black/40' />
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className='flex-1 justify-center items-center'
                    >
                        <View className='bg-white rounded-xl p-6 items-center shadow-lg min-w-[320px] max-w-[90%]'>
                            {children}
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </RNModal>
    )
}

export default Modal