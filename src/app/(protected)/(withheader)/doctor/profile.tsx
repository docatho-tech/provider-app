import PrimaryButton from '@/components/common/PrimaryButton'
import ThemedText from '@/components/common/ThemedText'
import Input from '@/components/general/Input'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Switch, View } from 'react-native'
import Toast from 'react-native-toast-message'

interface DoctorProfile {
  provider_name: string
  biography: string
  qualifications: string
  experience_years: number
  languages: string[]
  consultation_modes: string[]
  medical_reg_no: string
  fee_online: string
  fee_in_clinic: string
  fee_home_visit: string
  clinic_name: string
  clinic_city: string
  clinic_address: string
  is_online: boolean
  auto_accept_appointments: boolean
  verification_status: string
  is_verified: boolean
}

/** The modes a patient can book. Unticked here means the slot picker never
 *  offers it, whatever availability slots exist for it. */
const MODES = [
  { value: 'online', label: 'Online' },
  { value: 'in_clinic', label: 'In clinic' },
  { value: 'home_visit', label: 'Home visit' },
]

const DoctorPracticeProfile = () => {
  const router = useRouter()
  const [profile, setProfile] = useState<DoctorProfile | null>(null)
  const { requestGET, isLoading } = useAxios<DoctorProfile>(API_ENDPOINTS.DOCTOR_PROFILE)
  const { requestPATCH, isLoading: saving } = useAxios(API_ENDPOINTS.DOCTOR_PROFILE)

  useEffect(() => { requestGET().then((r) => { if (r.status === 200) setProfile(r.data) }) }, [])

  const toggleMode = (mode: string) => setProfile((p) => p && ({
    ...p,
    consultation_modes: p.consultation_modes?.includes(mode)
      ? p.consultation_modes.filter((m) => m !== mode)
      : [...(p.consultation_modes ?? []), mode],
  }))

  const save = async () => {
    if (!profile) return
    const res = await requestPATCH({
      biography: profile.biography,
      qualifications: profile.qualifications,
      experience_years: profile.experience_years,
      languages: profile.languages ?? [],
      consultation_modes: profile.consultation_modes ?? [],
      medical_reg_no: profile.medical_reg_no,
      fee_online: profile.fee_online,
      fee_in_clinic: profile.fee_in_clinic,
      fee_home_visit: profile.fee_home_visit,
      clinic_name: profile.clinic_name,
      clinic_city: profile.clinic_city,
      clinic_address: profile.clinic_address,
      is_online: profile.is_online,
      auto_accept_appointments: profile.auto_accept_appointments,
    })
    if (res.status === 200) {
      Toast.show({ type: 'success', text1: 'Profile updated' })
      return
    }
    // Without this the button just settles and nothing changes, which reads as
    // a successful save — the doctor walks away believing their fee is live.
    Toast.show({ type: 'error', text1: 'Could not save your profile', text2: 'Please try again.' })
  }

  if (isLoading || !profile) return <ActivityIndicator className='mt-[40px]' color={Colors.primary} />

  return (
    <ScrollView className='flex-1 bg-white px-[5%] pt-[20px]'>
      <ThemedText size='largeHeading' className='font-bold'>Practice Profile</ThemedText>
      <ThemedText className='text-secondaryTextColor mt-[4px]'>{profile.provider_name}</ThemedText>
      {profile.is_verified ? (
        <ThemedText size='small' className='text-green-600 mt-[4px]'>Verified provider</ThemedText>
      ) : (
        <ThemedText size='small' className='text-amber-600 mt-[4px] capitalize'>Status: {profile.verification_status}</ThemedText>
      )}

      <View className='flex-row items-center justify-between mt-[20px] p-[14px] bg-[#F7F9FC] rounded-[12px]'>
        <View>
          <ThemedText className='font-semibold'>Available online</ThemedText>
          <ThemedText size='small' className='text-secondaryTextColor'>Patients can see you as online</ThemedText>
        </View>
        <Switch value={profile.is_online} onValueChange={(v) => setProfile({ ...profile, is_online: v })} trackColor={{ true: Colors.primary }} />
      </View>

      <View className='flex-row items-center justify-between mt-[12px] p-[14px] bg-[#F7F9FC] rounded-[12px]'>
        <View className='flex-1 pr-[12px]'>
          <ThemedText className='font-semibold'>Auto-accept appointments</ThemedText>
          <ThemedText size='small' className='text-secondaryTextColor'>Skip manual confirmation step</ThemedText>
        </View>
        <Switch value={profile.auto_accept_appointments} onValueChange={(v) => setProfile({ ...profile, auto_accept_appointments: v })} trackColor={{ true: Colors.primary }} />
      </View>

      <View className='mt-[20px]'>
        <ThemedText className='font-semibold'>Consultation modes</ThemedText>
        <ThemedText size='small' className='text-secondaryTextColor mt-[2px]'>What patients can book you for</ThemedText>
        <View className='flex-row gap-[8px] mt-[10px]'>
          {MODES.map((m) => {
            const on = profile.consultation_modes?.includes(m.value)
            return (
              <Pressable
                key={m.value}
                onPress={() => toggleMode(m.value)}
                className={`px-[14px] py-[8px] rounded-full border ${on ? 'bg-primary border-primary' : 'border-primary/20'}`}
              >
                <ThemedText size='small' className={on ? 'text-white font-semibold' : 'text-secondaryTextColor'}>{m.label}</ThemedText>
              </Pressable>
            )
          })}
        </View>
      </View>

      <View className='mt-[16px] gap-[12px]'>
        <Input label='Biography' value={profile.biography} onChange={(v) => setProfile({ ...profile, biography: v })} />
        <Input label='Qualifications' value={profile.qualifications} onChange={(v) => setProfile({ ...profile, qualifications: v })} />
        <Input label='Medical registration number' value={profile.medical_reg_no ?? ''}
          onChange={(v) => setProfile({ ...profile, medical_reg_no: v })} />
        {profile.medical_reg_no ? null : (
          // A prescription without a council number is not a valid
          // prescription, and nothing else in the app tells the doctor that.
          <ThemedText size='small' className='text-amber-600 mt-[-6px]'>
            Required on every prescription you sign.
          </ThemedText>
        )}
        {/* Stored as a list, typed as one line: a chip editor for three or four
            languages is more screen than the field is worth. */}
        <Input label='Languages (comma separated)' value={(profile.languages ?? []).join(', ')}
          onChange={(v) => setProfile({
            ...profile,
            languages: v.split(',').map((l) => l.trim()).filter(Boolean),
          })} />
        <Input label='Experience (years)' value={String(profile.experience_years ?? '')} keyboardType='numeric'
          onChange={(v) => setProfile({ ...profile, experience_years: Number(v) || 0 })} />
        <Input label='Online fee' value={String(profile.fee_online)} onChange={(v) => setProfile({ ...profile, fee_online: v })} keyboardType='numeric' />
        <Input label='In-clinic fee' value={String(profile.fee_in_clinic)} onChange={(v) => setProfile({ ...profile, fee_in_clinic: v })} keyboardType='numeric' />
        <Input label='Home visit fee' value={String(profile.fee_home_visit)} onChange={(v) => setProfile({ ...profile, fee_home_visit: v })} keyboardType='numeric' />
        <Input label='Clinic name' value={profile.clinic_name} onChange={(v) => setProfile({ ...profile, clinic_name: v })} />
        <Input label='Clinic address' value={profile.clinic_address} onChange={(v) => setProfile({ ...profile, clinic_address: v })} />
        <Input label='City' value={profile.clinic_city} onChange={(v) => setProfile({ ...profile, clinic_city: v })} />
      </View>
      <PrimaryButton title='Save Profile' className='mt-[20px]' onPress={save} loading={saving} />
      <PrimaryButton title='Manage Availability' className='mt-[12px] mb-[40px]' onPress={() => router.push('/doctor/availability')} />
    </ScrollView>
  )
}
export default DoctorPracticeProfile
