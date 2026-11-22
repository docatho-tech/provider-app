import PrimaryButton from '@/components/common/PrimaryButton'
import ThemedText from '@/components/common/ThemedText'
import DatePicker from '@/components/general/DatePicker'
import Select from '@/components/general/Select'
import TimePicker from '@/components/general/TimePicker'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'

interface Slot { id: number; day_of_week: number; start_time: string; end_time: string; consultation_mode: string; is_active: boolean }
interface BlockedDate { date: string; reason: string }
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_OPTIONS = DAYS.map((d, i) => ({ label: d, value: String(i) }))
const MODE_OPTIONS = [
  { label: 'Online', value: 'online' },
  { label: 'In clinic', value: 'in_clinic' },
  { label: 'Home visit', value: 'home_visit' },
]

const formatTime = (date: Date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
/** YYYY-MM-DD in the phone's own timezone. `toISOString()` is UTC, which moves
 *  a leave day back to the previous date for anyone east of Greenwich. */
const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const dateLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
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
  const [blocked, setBlocked] = useState<BlockedDate[]>([])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [leaveDate, setLeaveDate] = useState(new Date())
  // On Android the picker fires onChange and onSave in the same tick, so the
  // `leaveDate` state is still the previous value by the time we submit. The
  // ref is what the day actually came from.
  const pickedDate = useRef(new Date())
  const { requestGET, isLoading } = useAxios<{ availability: Slot[]; blocked_dates: BlockedDate[] }>(API_ENDPOINTS.AVAILABILITY)
  const { requestPOST, isLoading: saving } = useAxios(API_ENDPOINTS.AVAILABILITY)
  const { requestPATCH } = useAxios(API_ENDPOINTS.AVAILABILITY)
  const { requestPOST: blockDate, requestDELETE: unblockDate, isLoading: blocking } = useAxios(API_ENDPOINTS.BLOCKED_DATES)

  const load = () => requestGET().then((r) => {
    if (r.status === 200) {
      setSlots(r.data.availability)
      setBlocked(r.data.blocked_dates ?? [])
    }
  })
  useEffect(() => { load() }, [])

  const addLeave = async (date: Date) => {
    const iso = formatDate(date)
    if (blocked.some((b) => b.date === iso)) {
      Toast.show({ type: 'info', text1: 'That day is already blocked' })
      return
    }
    try {
      const res = await blockDate({ date: iso })
      if (res.status === 201 || res.status === 200) {
        Toast.show({ type: 'success', text1: `${dateLabel(iso)} blocked` })
        load()
      }
    } catch {
      // requestPOST already toasted the reason; it rethrows, and an uncaught
      // throw here would take the screen down.
    }
  }

  const removeLeave = (date: string) => Alert.alert(
    'Take bookings again?',
    `Patients will be able to book you on ${dateLabel(date)}.`,
    [
      { text: 'Keep blocked', style: 'cancel' },
      {
        text: 'Unblock',
        onPress: async () => {
          try {
            const res = await unblockDate(`${API_ENDPOINTS.BLOCKED_DATES}?date=${date}`)
            if (res.status === 204 || res.status === 200) {
              Toast.show({ type: 'success', text1: 'Day unblocked' })
              load()
            }
          } catch { /* toasted by requestDELETE */ }
        },
      },
    ],
  )

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
      return
    }
    // The overlap rejection arrives as a 400 with a `detail`, which useAxios
    // already toasts. This is the fallback for everything else, so the form
    // never just sits there looking saved.
    if (!res.status) Toast.show({ type: 'error', text1: 'Could not save the slot', text2: 'Please try again.' })
  }

  const deleteSlot = async (slot: Slot) => {
    const res = await requestPATCH({ id: slot.id, is_active: false })
    if (res.status === 200) {
      Toast.show({ type: 'success', text1: 'Slot removed' })
      load()
      return
    }
    if (!res.status) Toast.show({ type: 'error', text1: 'Could not remove the slot', text2: 'Please try again.' })
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

      <View className='mt-[28px] pt-[20px] border-t border-primary/10'>
        <ThemedText size='subheading' className='font-bold'>Days off</ThemedText>
        <ThemedText size='small' className='text-secondaryTextColor mt-[4px]'>
          Leave, conferences, holidays — patients cannot book you on these days whatever your weekly hours say
        </ThemedText>

        {blocked.length === 0 ? (
          <ThemedText size='small' className='text-secondaryTextColor mt-[14px]'>No days blocked.</ThemedText>
        ) : blocked.map((b) => (
          <View key={b.date} className='mt-[10px] p-[12px] border border-primary/10 rounded-[8px] flex-row justify-between items-center'>
            <View className='flex-1 pr-[8px]'>
              <ThemedText className='font-semibold'>{dateLabel(b.date)}</ThemedText>
              {b.reason ? (
                <ThemedText size='small' className='text-secondaryTextColor mt-[2px]'>{b.reason}</ThemedText>
              ) : null}
            </View>
            <Pressable onPress={() => removeLeave(b.date)} className='px-[10px] py-[6px] border border-primary/20 rounded-[6px]'>
              <ThemedText className='text-primary text-[13px]'>Unblock</ThemedText>
            </Pressable>
          </View>
        ))}

        <PrimaryButton
          title='Block a day'
          className='mt-[16px]'
          loading={blocking}
          onPress={() => { pickedDate.current = leaveDate; setShowDatePicker(true) }}
        />
      </View>

      <View className='h-[40px]' />

      <DatePicker
        show={showDatePicker}
        date={leaveDate}
        onChange={(d) => { pickedDate.current = d; setLeaveDate(d) }}
        onSave={() => { setShowDatePicker(false); addLeave(pickedDate.current) }}
        onClose={() => setShowDatePicker(false)}
      />

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
