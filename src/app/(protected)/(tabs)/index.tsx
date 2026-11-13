import ChemistHomePage from '@/components/home/ChemistHomePage'
import DoctorHomePage from '@/components/home/DoctorHomePage'
import LabHomePage from '@/components/home/LabHomePage'
import { Colors } from '@/constants/Colors'
import { useProviderType } from '@/hooks/useProviderType'
import React from 'react'
import { ActivityIndicator, View } from 'react-native'

/** The dashboard tab, showing whichever queue the signed-in partner works. */
export default function Index() {
  const { persona, isLoading } = useProviderType()

  if (isLoading) {
    return (
      <View className='flex-1 bg-page'>
        <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
      </View>
    )
  }

  if (persona === 'doctor') return <DoctorHomePage />
  if (persona === 'lab') return <LabHomePage />
  return <ChemistHomePage />
}
