import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { STORAGE_KEYS } from '@/constants/base'
import useAxios from '@/hooks/useAxios'
import StorageService from '@/utils/storage'
import { useEffect, useState } from 'react'

export interface ProviderProfile { id: number; name: string; specialty: string; provider_type: string }

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
  const isChemist = providerType === 'Chemist' || !providerType
  return { providerType, isDoctor, isChemist, isLoading }
}
