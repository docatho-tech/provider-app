import PrimaryButton from '@/components/common/PrimaryButton'
import ThemedText from '@/components/common/ThemedText'
import KeyboardAwareWrapper from '@/components/common/WithKeyboardAwareScrollView'
import DatePicker from '@/components/general/DatePicker'
import Input from '@/components/general/Input'
import ChevronDown from '@/components/icons/ChevronDown'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import { profileValidation } from '@/constants/validations/base'
import { AuthContext } from '@/contexts/authenticationContext'
import useAxios from '@/hooks/useAxios'
import { useAppDispatch, useAppSelector } from '@/hooks/useStoreHooks'
import { useProviderType } from '@/hooks/useProviderType'
import { getProfileDetails } from '@/store/slices/authenticationSlice'
import { getFormattedDate } from '@/utils/base'
import { Formik, FormikHelpers } from 'formik'
import { RelativePathString, useRouter } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const initialValues = { name: '', dob: '', email: '' }

const Profile = () => {
  const router = useRouter()
  const { isDoctor, isChemist } = useProviderType()
  const { logOut } = useContext(AuthContext)
  const dispatch = useAppDispatch()
  const profileResponse = useAppSelector((state) => state.authentication.profile)
  const { requestPATCH: updateProfile, isLoading: isUpdatingProfile } = useAxios<{detail: string}>(API_ENDPOINTS.UPDATE_PROFILE)
  const { requestGET: getProviderProfile, response: providerProfile } = useAxios<{ name: string; specialty: string; provider_type: string }>(API_ENDPOINTS.GET_PROFILE_PROVIDER)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [formInitialValues, setFormInitialValues] = useState(initialValues)

  useEffect(() => {
    dispatch(getProfileDetails())
    getProviderProfile()
  }, [])

  useEffect(() => {
    if (profileResponse) {
      setFormInitialValues({
        name: profileResponse.name || '',
        dob: profileResponse.dob || '',
        email: profileResponse.email || '',
      })
    }
  }, [profileResponse])

  const handleUpdateProfile = async (values: typeof initialValues) => {
    const response = await updateProfile({ name: values.name, dob: values.dob })
    if (response.status === 200 || response.status === 201) {
      Toast.show({ type: 'success', text1: 'Profile updated successfully' })
      dispatch(getProfileDetails())
    }
  }

  return (
    <KeyboardAwareWrapper>
      <SafeAreaView className='flex-1 bg-white'>
        <View className='px-[7%] py-[20px]'>
          {providerProfile && (
            <View className='mb-[16px] p-[12px] bg-primary/5 rounded-[12px] border border-primary/10'>
              <ThemedText className='font-semibold'>{providerProfile.name}</ThemedText>
              <ThemedText size='small' className='text-secondaryTextColor mt-[4px]'>
                {providerProfile.provider_type}{providerProfile.specialty ? ` · ${providerProfile.specialty}` : ''}
              </ThemedText>
            </View>
          )}
          <Formik initialValues={formInitialValues} onSubmit={handleUpdateProfile} validationSchema={profileValidation}
            validateOnChange={false} enableReinitialize>
            {({ handleChange, handleSubmit, values, errors, setFieldValue }) => (
              <>
                <View className='gap-[20px]'>
                  <Input label='Full Name' inputClassName='border border-[#CDD1E0] rounded-default h-[50px] pl-[10px]'
                    placeholder='Enter your full name' value={values.name} onChange={handleChange('name')} error={errors.name} />
                  <Input label='Date of Birth' inputClassName='border border-[#CDD1E0] rounded-default h-[50px] pl-[10px] pr-[10px]'
                    placeholder='Enter your date of birth' value={values.dob} error={errors.dob} editable={false}
                    onPress={() => setShowDatePicker(true)} endAdornment={<ChevronDown color={Colors.secondaryTextColor} size={20} />} />
                  <Input label='Email' inputClassName='border border-[#CDD1E0] rounded-default h-[50px] pl-[10px] bg-gray-100'
                    placeholder='E.g. john@gmail.com' value={values.email} onChange={handleChange('email')} error={errors.email} editable={false} />

                  {isDoctor && (
                    <PrimaryButton className='!h-[50px]' title='Doctor Practice Settings' onPress={() => router.push('/doctor/profile')} />
                  )}
                  {isChemist && (
                    <>
                      <PrimaryButton className='!h-[50px]' title='View Earnings' onPress={() => router.push('/earnings' as RelativePathString)} />
                      <PrimaryButton className='!h-[50px]' title='Bank & Payout Details' onPress={() => router.push('/bank' as RelativePathString)} />
                    </>
                  )}

                  <PrimaryButton className='!h-[50px]' title='Update Profile' onPress={handleSubmit}
                    loading={isUpdatingProfile} disabled={isUpdatingProfile} />
                  <Pressable className='border border-red-500 rounded-default h-[50px] items-center justify-center mt-[10px]' onPress={logOut}>
                    <ThemedText className='text-red-500 font-semibold'>Logout</ThemedText>
                  </Pressable>
                </View>
                <DatePicker show={showDatePicker} date={values.dob ? new Date(values.dob) : new Date()}
                  onChange={(date) => setFieldValue('dob', getFormattedDate(date, 'YYYY-MM-DD'))}
                  onSave={() => setShowDatePicker(false)} onClose={() => setShowDatePicker(false)} />
              </>
            )}
          </Formik>
        </View>
      </SafeAreaView>
    </KeyboardAwareWrapper>
  )
}

export default Profile
