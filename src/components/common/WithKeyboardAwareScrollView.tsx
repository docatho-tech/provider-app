import React from 'react'
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller'

const WithKeyboardAwareScrollView = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  return (props: P) => {
    return (
      <>
        <KeyboardAwareScrollView bottomOffset={62} className='flex-1'>
          <WrappedComponent {...props} />
        </KeyboardAwareScrollView>
        <KeyboardToolbar />
      </>
    )
  }
}

export default WithKeyboardAwareScrollView
