import PrimaryButton from '@/components/common/PrimaryButton';
import KeyboardAwareWrapper from '@/components/common/WithKeyboardAwareScrollView';
import Input from '@/components/general/Input';
import { API_ENDPOINTS } from '@/constants/APIEndpoints';
import Images from '@/constants/Images';
import { phoneNumberValidation } from '@/constants/validations/base';
import useAxios from '@/hooks/useAxios';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Formik, FormikHelpers } from 'formik';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const initialValues = {
  phone: ''
}

const Login = () => {
  const router = useRouter();
  const { requestPOST: sendOTP, isLoading: isSendingOTP } = useAxios<{detail: string}>(API_ENDPOINTS.SEND_OTP);

  const handleSendOTP = async (values: typeof initialValues, {resetForm}: FormikHelpers<typeof initialValues>) => {
    const body = {
      phone: `+91${values.phone}`
    }
    const response = await sendOTP(body);
    if(response.status === 200) {
      router.push(`/otp?phone=${values.phone}`);
      // resetForm();
    }
  }
  return (
    <KeyboardAwareWrapper>
      <SafeAreaView className='flex-1 bg-white'>
        <View className='flex-1 justify-center'>
          <Image
            source={Images.LoginScreenImage}
            contentFit='contain'
            style={{
              width: "100%",
              height: 423,
              marginBottom: 30
            }}
          />
          <View className='px-[7%]'>
            <Text className='text-primaryText text-[25px] font-normal mb-[40px]'> Login with phone number </Text>

            <Formik
              initialValues={initialValues}
              onSubmit={handleSendOTP}
              validationSchema={phoneNumberValidation}
            >
              {({ handleChange, handleSubmit, values, errors }) => (
                <>
                  <View className=''>
                    <Input
                      keyboardType='numeric'
                      value={values.phone}
                      onChange={handleChange('phone')}
                      placeholder='Enter your phone number'
                      label='Phone Number'
                      inputClassName='border border-[#CDD1E0] rounded-default h-[50px] pl-[10px]'
                      containerClassName='w-full'
                      labelClassName='w-full'
                      error={errors.phone}
                      maxLength={10}
                    />
                  </View>

                  <PrimaryButton
                    title='Login with otp'
                    className='mt-[40px]'
                    onPress={handleSubmit}
                    loading={isSendingOTP}
                    disabled={isSendingOTP}
                  />
                </>
              )}
            </Formik>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareWrapper>
  )
}

export default Login