import ThemedText from '@/components/common/ThemedText'
import { ScreenHeader } from '@/components/layout/Headers'
import { Card, CardRow, CardSection } from '@/components/ui/Card'
import { Chip, IconPill } from '@/components/ui/Primitives'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import { getFormattedPrice } from '@/utils/base'
import Feather from '@expo/vector-icons/Feather'
import { RelativePathString, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Switch, View } from 'react-native'
import Toast from 'react-native-toast-message'

interface DoctorCatalog {
  provider_name: string
  qualifications: string
  experience_years: number
  fee_online: string
  fee_in_clinic: string
  fee_home_visit: string
  clinic_name: string
  clinic_city: string
  is_online: boolean
  verification_status: string
  is_verified: boolean
}

/**
 * What this doctor offers and what each way of seeing them costs.
 *
 * No mockup was supplied for this tab, so it is built from the same card system
 * as the rest of the app against the fields the practice profile already has —
 * the three consultation fees, the clinic, and the switch that decides whether
 * any of it is bookable right now. A mode priced at zero is not offered, and is
 * labelled that way rather than shown as free.
 */
const CatalogTab = () => {
  const router = useRouter()
  const [profile, setProfile] = useState<DoctorCatalog | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const { requestGET, isLoading } = useAxios<DoctorCatalog>(API_ENDPOINTS.DOCTOR_PROFILE)
  const { requestPATCH } = useAxios(API_ENDPOINTS.DOCTOR_PROFILE)

  const load = () => requestGET().then((r) => { if (r.status === 200) setProfile(r.data) })
  useEffect(() => { load() }, [])
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }

  const setOnline = async (is_online: boolean) => {
    setProfile((current) => (current ? { ...current, is_online } : current))
    const res = await requestPATCH({ is_online })
    if (res.status !== 200) {
      // Put the switch back rather than leaving it showing a state the server
      // never accepted — this one decides whether patients can book at all.
      setProfile((current) => (current ? { ...current, is_online: !is_online } : current))
      Toast.show({ type: 'error', text1: 'Could not change your availability' })
    }
  }

  if (isLoading && !profile) {
    return (
      <View className='flex-1 bg-page'>
        <ScreenHeader title='Catalog' backButtonRoute='/' />
        <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
      </View>
    )
  }

  const modes = profile ? [
    { key: 'in_clinic', label: 'In-Clinic visit', icon: 'home' as const, fee: profile.fee_in_clinic },
    { key: 'online', label: 'Online Consultation', icon: 'video' as const, fee: profile.fee_online },
    { key: 'home_visit', label: 'Home visit', icon: 'map-pin' as const, fee: profile.fee_home_visit },
  ] : []

  return (
    <View className='flex-1 bg-page'>
      <ScreenHeader title='Catalog' backButtonRoute='/' />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Card>
          <CardSection icon={<Feather name='user' size={15} color={Colors.primaryTextColor} />} title='Practice' />
          <CardRow first>
            <View className='flex-row items-start justify-between gap-x-[12px]'>
              <View className='flex-1'>
                <ThemedText size='subheading' className='font-bold'>{profile?.provider_name}</ThemedText>
                <ThemedText size='small' className='mt-[4px]' style={{ color: Colors.mutedTextColor }}>
                  {[profile?.qualifications, profile?.experience_years ? `${profile.experience_years} yrs` : null]
                    .filter(Boolean).join(' • ') || 'No credentials on file'}
                </ThemedText>
              </View>
              <Chip
                tone={profile?.is_verified ? 'success' : 'soft'}
                label={profile?.is_verified ? 'Verified' : (profile?.verification_status ?? 'Pending')}
              />
            </View>
          </CardRow>
          <CardRow>
            <View className='flex-row items-center justify-between'>
              <View className='flex-1 pr-[12px]'>
                <ThemedText size='subheading' className='font-semibold'>Accepting bookings</ThemedText>
                <ThemedText size='small' className='mt-[4px]' style={{ color: Colors.mutedTextColor }}>
                  Turn this off and patients cannot book any of the below.
                </ThemedText>
              </View>
              <Switch
                value={!!profile?.is_online}
                onValueChange={setOnline}
                trackColor={{ true: Colors.primary, false: '#D9D9D9' }}
              />
            </View>
          </CardRow>
        </Card>

        <Card>
          <CardSection icon={<Feather name='list' size={15} color={Colors.primaryTextColor} />} title='Consultation types' />
          {modes.map((mode, index) => {
            const fee = Number(mode.fee ?? 0)
            return (
              <CardRow key={mode.key} first={index === 0}>
                <View className='flex-row items-center gap-x-[12px]'>
                  <IconPill><Feather name={mode.icon} size={17} color={Colors.primary} /></IconPill>
                  <View className='flex-1'>
                    <ThemedText size='subheading' className='font-semibold'>{mode.label}</ThemedText>
                    <ThemedText size='small' className='mt-[3px]' style={{ color: Colors.mutedTextColor }}>
                      {fee > 0 ? 'Bookable' : 'Not offered'}
                    </ThemedText>
                  </View>
                  <ThemedText size='subheading' className='font-semibold'>
                    {fee > 0 ? getFormattedPrice(fee) : '—'}
                  </ThemedText>
                </View>
              </CardRow>
            )
          })}
        </Card>

        <Card>
          <CardSection icon={<Feather name='clock' size={15} color={Colors.primaryTextColor} />} title='Manage' />
          <ManageRow
            first
            icon='edit-3'
            label='Edit fees and profile'
            onPress={() => router.push('/doctor/profile' as RelativePathString)}
          />
          <ManageRow
            icon='calendar'
            label='Availability and slots'
            onPress={() => router.push('/doctor/availability' as RelativePathString)}
          />
        </Card>
      </ScrollView>
    </View>
  )
}

const ManageRow = ({ icon, label, onPress, first }: {
  icon: React.ComponentProps<typeof Feather>['name']
  label: string
  onPress: () => void
  first?: boolean
}) => (
  <Pressable onPress={onPress}>
    <CardRow first={first}>
      <View className='flex-row items-center gap-x-[12px]'>
        <IconPill><Feather name={icon} size={17} color={Colors.primary} /></IconPill>
        <ThemedText size='subheading' className='font-semibold flex-1'>{label}</ThemedText>
        <Feather name='chevron-right' size={18} color={Colors.mutedTextColor} />
      </View>
    </CardRow>
  </Pressable>
)

export default CatalogTab
