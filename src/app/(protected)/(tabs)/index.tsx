import ChemistHomePage from '@/components/home/ChemistHomePage'
import DoctorHomePage from '@/components/home/DoctorHomePage'
import { useProviderType } from '@/hooks/useProviderType'
import { ActivityIndicator } from 'react-native'
import { Colors } from '@/constants/Colors'

export default function Index() {
  const { isDoctor, isLoading } = useProviderType()

  if (isLoading) {
    return <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
  }

  if (isDoctor) {
    return <DoctorHomePage />
  }

  return <ChemistHomePage />
}
