import PrimaryButton from '@/components/common/PrimaryButton'
import ThemedText from '@/components/common/ThemedText'
import Input from '@/components/general/Input'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import { ProviderBankDetails } from '@/interfaces/provider'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'

const emptyBank: ProviderBankDetails = {
  bank_account_name: '',
  bank_account_number: '',
  bank_ifsc: '',
  upi_id: '',
}

const BankScreen = () => {
  const [form, setForm] = useState<ProviderBankDetails>(emptyBank)
  const { requestGET, isLoading } = useAxios<ProviderBankDetails>(API_ENDPOINTS.BANK)
  const { requestPATCH, isLoading: saving } = useAxios<ProviderBankDetails>(API_ENDPOINTS.BANK)

  const load = () => requestGET().then((r) => {
    if (r.status === 200) {
      setForm({
        bank_account_name: r.data.bank_account_name ?? '',
        bank_account_number: r.data.bank_account_number ?? '',
        bank_ifsc: r.data.bank_ifsc ?? '',
        upi_id: r.data.upi_id ?? '',
      })
    }
  })

  useEffect(() => { load() }, [])

  const save = async () => {
    const res = await requestPATCH({
      bank_account_name: form.bank_account_name || null,
      bank_account_number: form.bank_account_number || null,
      bank_ifsc: form.bank_ifsc || null,
      upi_id: form.upi_id || null,
    })
    if (res.status === 200) {
      Toast.show({ type: 'success', text1: 'Payout details saved' })
    }
  }

  if (isLoading) return <ActivityIndicator className='mt-[40px]' color={Colors.primary} />

  return (
    <ScrollView className='flex-1 bg-white px-[5%] pt-[20px]'>
      <ThemedText size='largeHeading' className='font-bold'>Bank & Payout</ThemedText>
      <ThemedText className='text-secondaryTextColor mt-[6px]'>Where we send your earnings</ThemedText>

      <View className='mt-[20px] gap-[14px]'>
        <Input
          label='Account holder name'
          value={form.bank_account_name ?? ''}
          onChange={(v) => setForm({ ...form, bank_account_name: v })}
          inputClassName='border border-[#CDD1E0] rounded-default h-[50px] pl-[10px]'
          placeholder='Name as per bank records'
        />
        <Input
          label='Account number'
          value={form.bank_account_number ?? ''}
          onChange={(v) => setForm({ ...form, bank_account_number: v })}
          inputClassName='border border-[#CDD1E0] rounded-default h-[50px] pl-[10px]'
          keyboardType='numeric'
          placeholder='Enter account number'
        />
        <Input
          label='IFSC code'
          value={form.bank_ifsc ?? ''}
          onChange={(v) => setForm({ ...form, bank_ifsc: v.toUpperCase() })}
          inputClassName='border border-[#CDD1E0] rounded-default h-[50px] pl-[10px]'
          placeholder='e.g. HDFC0001234'
          maxLength={11}
        />
        <Input
          label='UPI ID (optional)'
          value={form.upi_id ?? ''}
          onChange={(v) => setForm({ ...form, upi_id: v })}
          inputClassName='border border-[#CDD1E0] rounded-default h-[50px] pl-[10px]'
          placeholder='name@upi'
        />
      </View>

      <PrimaryButton title='Save Details' className='mt-[24px] mb-[40px]' onPress={save} loading={saving} disabled={saving} />
    </ScrollView>
  )
}

export default BankScreen
