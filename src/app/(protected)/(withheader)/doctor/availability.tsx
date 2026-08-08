import PrimaryButton from '@/components/common/PrimaryButton'
import ThemedText from '@/components/common/ThemedText'
import Select from '@/components/general/Select'
import TimePicker from '@/components/general/TimePicker'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'

interface Slot { id: number; day_of_week: number; start_time: string; end_time: string; consultation_mode: string; is_active: boolean }
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_OPTIONS = DAYS.map((d, i) => ({ label: d, value: String(i) }))
const MODE_OPTIONS = [
  { label: 'Online', value: 'online' },
  { label: 'In clinic', value: 'in_clinic' },
  { label: 'Home visit', value: 'home_visit' },
]

const formatTime = (date: Date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
const parseTime = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

const DoctorAvailability = () => {
  const [slots, setSlots] = useState<Slot[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)
  const [dayOfWeek, setDayOfWeek] = useState('1')
  const [mode, setMode] = useState('online')
  const [startTime, setStartTime] = useState(new Date(new Date().setHours(9, 0, 0, 0)))
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(17, 0, 0, 0)))
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [showDaySelect, setShowDaySelect] = useState(false)
  const [showModeSelect, setShowModeSelect] = useState(false)
  const { requestGET, isLoading } = useAxios<{ availability: Slot[] }>(API_ENDPOINTS.AVAILABILITY)
  const { requestPOST, isLoading: saving } = useAxios(API_ENDPOINTS.AVAILABILITY)
  const { requestPATCH } = useAxios(API_ENDPOINTS.AVAILABILITY)

  const load = () => requestGET().then((r) => { if (r.status === 200) setSlots(r.data.availability) })
  useEffect(() => { load() }, [])

  const resetForm = () => {
    setEditingSlot(null)
    setDayOfWeek('1')
    setMode('online')
    setStartTime(new Date(new Date().setHours(9, 0, 0, 0)))
    setEndTime(new Date(new Date().setHours(17, 0, 0, 0)))
    setShowForm(false)
  }

  const openEdit = (slot: Slot) => {
    setEditingSlot(slot)
    setDayOfWeek(String(slot.day_of_week))
    setMode(slot.consultation_mode)
    setStartTime(parseTime(slot.start_time))
    setEndTime(parseTime(slot.end_time))
    setShowForm(true)
  }

  const saveSlot = async () => {
    const payload = {
      day_of_week: Number(dayOfWeek),
      start_time: formatTime(startTime),
      end_time: formatTime(endTime),
      consultation_mode: mode,
      is_active: true,
    }
    const res = editingSlot
      ? await requestPATCH({ id: editingSlot.id, ...payload })
      : await requestPOST(payload)
    if (res.status === 200 || res.status === 201) {
      Toast.show({ type: 'success', text1: editingSlot ? 'Slot updated' : 'Slot added' })
      resetForm()
      load()
    }
  }

  const deleteSlot = async (slot: Slot) => {
    const res = await requestPATCH({ id: slot.id, is_active: false })
    if (res.status === 200) {
      Toast.show({ type: 'success', text1: 'Slot removed' })
      load()
    }
  }

  if (isLoading) return <ActivityIndicator className='mt-[40px]' color={Colors.primary} />

  return (
    <ScrollView className='flex-1 bg-white px-[5%] pt-[20px]'>
      <ThemedText size='largeHeading' className='font-bold'>Availability</ThemedText>
      <ThemedText className='text-secondaryTextColor mt-[6px]'>Set when patients can book you</ThemedText>

      {slots.length === 0 ? (
        <ThemedText className='text-secondaryTextColor mt-[20px]'>No slots yet. Add your first slot below.</ThemedText>
      ) : slots.map((s) => (
        <View key={s.id} className='mt-[10px] p-[12px] border border-primary/10 rounded-[8px] flex-row justify-between items-center'>
          <View className='flex-1 pr-[8px]'>
            <ThemedText className='font-semibold'>{DAYS[s.day_of_week]}</ThemedText>
            <ThemedText size='small' className='text-secondaryTextColor mt-[2px]'>
              {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)} · {s.consultation_mode.replace('_', ' ')}
            </ThemedText>
          </View>
          <View className='flex-row gap-[8px]'>
            <Pressable onPress={() => openEdit(s)} className='px-[10px] py-[6px] border border-primary/20 rounded-[6px]'>
              <ThemedText className='text-primary text-[13px]'>Edit</ThemedText>
            </Pressable>
            <Pressable onPress={() => deleteSlot(s)} className='px-[10px] py-[6px] border border-red-200 rounded-[6px]'>
              <ThemedText className='text-red-500 text-[13px]'>Delete</ThemedText>
            </Pressable>
          </View>
        </View>
      ))}

      {showForm ? (
        <View className='mt-[20px] p-[14px] border border-primary/20 rounded-[12px] gap-[12px]'>
          <ThemedText className='font-semibold'>{editingSlot ? 'Edit slot' : 'New slot'}</ThemedText>
          <Pressable className='border border-primary/20 rounded-[8px] p-[12px]' onPress={() => setShowDaySelect(true)}>
            <ThemedText size='small' className='text-secondaryTextColor'>Day</ThemedText>
            <ThemedText>{DAYS[Number(dayOfWeek)]}</ThemedText>
          </Pressable>
          <Pressable className='border border-primary/20 rounded-[8px] p-[12px]' onPress={() => setShowStartPicker(true)}>
            <ThemedText size='small' className='text-secondaryTextColor'>Start time</ThemedText>
            <ThemedText>{formatTime(startTime)}</ThemedText>
          </Pressable>
          <Pressable className='border border-primary/20 rounded-[8px] p-[12px]' onPress={() => setShowEndPicker(true)}>
            <ThemedText size='small' className='text-secondaryTextColor'>End time</ThemedText>
            <ThemedText>{formatTime(endTime)}</ThemedText>
          </Pressable>
          <Pressable className='border border-primary/20 rounded-[8px] p-[12px]' onPress={() => setShowModeSelect(true)}>
            <ThemedText size='small' className='text-secondaryTextColor'>Mode</ThemedText>
            <ThemedText className='capitalize'>{mode.replace('_', ' ')}</ThemedText>
          </Pressable>
          <View className='flex-row gap-[10px]'>
            <PrimaryButton title='Save' className='flex-1' onPress={saveSlot} loading={saving} />
            <Pressable className='flex-1 border border-primary/20 rounded-default items-center justify-center' onPress={resetForm}>
              <ThemedText>Cancel</ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        <PrimaryButton title='Add availability slot' className='mt-[20px]' onPress={() => setShowForm(true)} />
      )}

      <View className='h-[40px]' />

      <Select show={showDaySelect} onClose={() => setShowDaySelect(false)} onSave={() => setShowDaySelect(false)}
        selectedValue={dayOfWeek} onValueChange={(v) => setDayOfWeek(v.value)} items={DAY_OPTIONS} />
      <Select show={showModeSelect} onClose={() => setShowModeSelect(false)} onSave={() => setShowModeSelect(false)}
        selectedValue={mode} onValueChange={(v) => setMode(v.value)} items={MODE_OPTIONS} />
      <TimePicker show={showStartPicker} time={startTime} onChange={setStartTime}
        onSave={() => setShowStartPicker(false)} onClose={() => setShowStartPicker(false)} />
      <TimePicker show={showEndPicker} time={endTime} onChange={setEndTime}
        onSave={() => setShowEndPicker(false)} onClose={() => setShowEndPicker(false)} />
    </ScrollView>
  )
}
export default DoctorAvailability
