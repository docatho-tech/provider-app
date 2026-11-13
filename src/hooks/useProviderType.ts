import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { STORAGE_KEYS } from '@/constants/base'
import useAxios from '@/hooks/useAxios'
import StorageService from '@/utils/storage'
import { useEffect, useState } from 'react'

export interface ProviderProfile {
  id: number
  name: string
  specialty: string
  provider_type: string
  logo_url?: string
  city?: string
  location?: string
}

/** The three personas the app has screens for. */
export type Persona = 'doctor' | 'lab' | 'pharmacy'

/**
 * `Lab` and `Diagnostic Center` are two `provider_type` values for one persona:
 * both take bookings for tests, work the same queue and upload the same
 * reports. They are separate on the backend because the admin directory lists
 * them separately, which is not a reason for the app to have two of everything.
 */
const LAB_TYPES = ['Lab', 'Diagnostic Center']

export function useProviderType() {
  const [providerType, setProviderType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { requestGET } = useAxios<ProviderProfile>(API_ENDPOINTS.GET_PROFILE_PROVIDER)

  useEffect(() => {
    const load = async () => {
      const token = await StorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      if (!token) { setIsLoading(false); return }
      try {
        const res = await requestGET()
        if (res.status === 200) setProviderType(res.data.provider_type)
      } finally { setIsLoading(false) }
    }
    load()
  }, [])

  const isDoctor = providerType === 'Doctor'
  const isLab = LAB_TYPES.includes(providerType ?? '')
  // The fallback: an unrecognised partner type sees the pharmacy queue, which
  // is what every provider account saw before there was more than one persona.
  const isChemist = !isDoctor && !isLab

  const persona: Persona = isDoctor ? 'doctor' : isLab ? 'lab' : 'pharmacy'

  return { providerType, persona, isDoctor, isLab, isChemist, isLoading }
}
