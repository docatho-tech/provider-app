import PrimaryButton from '@/components/common/PrimaryButton';
import KeyboardAwareWrapper from '@/components/common/WithKeyboardAwareScrollView';
import { API_ENDPOINTS } from '@/constants/APIEndpoints';
import { Colors } from '@/constants/Colors';
import Images from '@/constants/Images';
import { AuthContext } from '@/contexts/authenticationContext';
import useAxios from '@/hooks/useAxios';
import { VerifyOTPResponse } from '@/interfaces/authentication';
import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OtpInput } from "react-native-otp-entry";
import { SafeAreaView } from 'react-native-safe-area-context';

const OTP = () => {
  const [otp, setOtp] = useState<string>('');
  const { requestPOST: verifyOTP, isLoading: isVerifyingOTP } = useAxios<VerifyOTPResponse>(API_ENDPOINTS.VERIFY_OTP);
  const { loginAndSetTokens } = useContext(AuthContext);
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const router = useRouter();

  const handleSubmit = async () => {
    const body = {
      phone: `+91${phone}`,
      otp: otp
    }

    const response = await verifyOTP(body);  

    if(response.status === 200) {
      loginAndSetTokens(response.data.token, response.data.token, "/");
    }
  }

  return (
    <KeyboardAwareWrapper>
      <SafeAreaView className='flex-1 bg-white'>
        <View className='h-full px-[7%] justify-center'>
          <Image
            source={Images.fullLogo}
            style={{
              width: 200,
              height: 100
            }}
            contentFit='contain'
          />
          <Text className='font-semibold text-[22px] text-primaryText'>Your OTP is on it's way</Text>
          {
            phone && (
              <View className='flex-row items-center gap-2'>
                <Text className='text-[14px] font-light text-[#313131] mt-[5px] flex-row'>+91 {phone}</Text>
                <Pressable className='flex-row items-center gap-1' onPress={() => router.back()}>
                  <Feather name='edit' size={16} color={Colors.primary} />
                  <Text className='text-primary'>Edit</Text>
                </Pressable>
              </View>
            )
          }

          <View className='mt-[50px] w-full'>
            <OtpInput
              type="numeric"
              numberOfDigits={4}
              onTextChange={(text) => setOtp(text)}
              placeholder='-'
              theme={{
                containerStyle: styles.container,
                pinCodeContainerStyle: styles.pinCodeContainer,
                focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                focusStickStyle: styles.focusStick,
                placeholderTextStyle: styles.placeholderTextStyle,
                inputsContainerStyle: styles.inputsContainerStyle
              }}
            />
          </View>

          <PrimaryButton title='Submit' onPress={handleSubmit} className='mt-[50px]' loading={isVerifyingOTP} disabled={isVerifyingOTP} />

          <Pressable className=''>
            <Text className='text-primary font-light text-center mt-[30px]'> Resend OTP </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAwareWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'space-between',
    gap: 10
  },
  pinCodeContainer: {
    width: 70
  },
  activePinCodeContainer: {
    borderColor: Colors.primary
  },
  focusStick: {
    backgroundColor: Colors.primary
  },
  placeholderTextStyle: {
    color: '#1F1F1F',
    fontSize: 24,
  },
  inputsContainerStyle: {
    width: '100%',
  }
});

export default OTP
