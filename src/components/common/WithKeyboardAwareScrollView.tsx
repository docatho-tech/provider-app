import React from 'react'
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller'

// Create a component wrapper instead of HOC to avoid hot reload issues
interface KeyboardAwareWrapperProps {
  children: React.ReactNode
}

const KeyboardAwareWrapper: React.FC<KeyboardAwareWrapperProps> = ({ children }) => {
  return (
    <React.Fragment>
      <KeyboardAwareScrollView 
        bottomOffset={62}
        className='flex-1'
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {children}
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </React.Fragment>
  )
}

export default KeyboardAwareWrapper
