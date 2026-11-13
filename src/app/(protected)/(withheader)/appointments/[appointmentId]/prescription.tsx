import ThemedText from '@/components/common/ThemedText'
import { ScreenHeader } from '@/components/layout/Headers'
import { Card, CardRow, CardSection } from '@/components/ui/Card'
import { ActionButton, StickyFooter } from '@/components/ui/Primitives'
import { API_ENDPOINTS } from '@/constants/APIEndpoints'
import { Colors } from '@/constants/Colors'
import useAxios from '@/hooks/useAxios'
import useCustomSafeAreaInsets from '@/hooks/useCustomSafeAreaInsets'
import useFileUpload from '@/hooks/useFileUpload'
import {
  AppointmentPrescription,
  PrescribedMedication,
  ProviderAppointment,
} from '@/interfaces/healthcare'
import { replaceUrlParams } from '@/utils/base'
import Feather from '@expo/vector-icons/Feather'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native'
import Toast from 'react-native-toast-message'

const EMPTY_MEDICATION: PrescribedMedication = { type: '', drug: '', dose: '', duration: '' }

type Form = Omit<AppointmentPrescription, 'id' | 'source' | 'document_url' | 'created_at' | 'updated_at'>

const EMPTY_FORM: Form = {
  bp: '', pulse: '', weight: '', height: '',
  complaints: '', allergies: '', diagnosis: '', advice: '',
  medications: [{ ...EMPTY_MEDICATION }],
  instructions: '', follow_up: '',
}

/**
 * The prescription the doctor writes once the consultation has happened.
 *
 * Two ways out of this screen and they produce the same document: fill the
 * form and the server renders the e-prescription PDF, or attach the sheet that
 * was written by hand. A consultation has one prescription, so saving again
 * corrects the one that exists rather than issuing a second.
 */
const PrescriptionScreen = () => {
  const router = useRouter()
  const { bottom } = useCustomSafeAreaInsets()
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>()
  const url = replaceUrlParams(API_ENDPOINTS.APPOINTMENT_PRESCRIPTION, { appointmentId })

  const { requestPOST } = useAxios<AppointmentPrescription>(url)
  // Read through the appointment rather than the prescription endpoint: that
  // one answers 404 when nothing has been written yet, which is the ordinary
  // case here and would toast an error every time the screen opened.
  const detailUrl = replaceUrlParams(API_ENDPOINTS.APPOINTMENT_DETAIL, { appointmentId })
  const { requestGET, isLoading } = useAxios<ProviderAppointment>(detailUrl)
  const { pickAndUpload, isUploading } = useFileUpload()

  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [saved, setSaved] = useState<AppointmentPrescription | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    (async () => {
      const res = await requestGET()
      const existing = res?.data?.prescription
      if (existing) {
        setSaved(existing)
        setForm({
          ...EMPTY_FORM,
          ...existing,
          medications: existing.medications?.length
            ? existing.medications
            : [{ ...EMPTY_MEDICATION }],
        })
      }
      setLoaded(true)
    })()
  }, [appointmentId])

  const set = (key: keyof Form) => (value: string) => setForm((current) => ({ ...current, [key]: value }))

  const setMedication = (index: number, key: keyof PrescribedMedication) => (value: string) =>
    setForm((current) => ({
      ...current,
      medications: current.medications.map((row, position) =>
        position === index ? { ...row, [key]: value } : row),
    }))

  const addMedication = () =>
    setForm((current) => ({ ...current, medications: [...current.medications, { ...EMPTY_MEDICATION }] }))

  const removeMedication = (index: number) =>
    setForm((current) => ({
      ...current,
      medications: current.medications.length > 1
        ? current.medications.filter((_row, position) => position !== index)
        : [{ ...EMPTY_MEDICATION }],
    }))

  const post = async (body: Record<string, unknown>) => {
    try {
      const res = await requestPOST(body)
      setSaved(res.data)
      Toast.show({ type: 'success', text1: 'Prescription saved' })
      router.back()
    } catch {
      // useAxios has already shown what went wrong.
    }
  }

  const save = async () => {
    const prescribed = form.medications.filter((row) => row.drug.trim())
    if (!form.diagnosis.trim() && !prescribed.length) {
      Toast.show({ type: 'error', text1: 'Add a diagnosis or at least one medicine' })
      return
    }
    setSaving(true)
    await post({ ...form, medications: prescribed })
    setSaving(false)
  }

  const attach = async () => {
    const fileUrl = await pickAndUpload()
    if (!fileUrl) return
    await post({ file_url: fileUrl })
  }

  if (!loaded && isLoading) {
    return (
      <View className='flex-1 bg-page'>
        <ScreenHeader title='Prescription' />
        <ActivityIndicator className='mt-[40px]' color={Colors.primary} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      className='flex-1 bg-page'
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title='Prescription' />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}
        keyboardShouldPersistTaps='handled'
      >
        {saved ? (
          <Card>
            <CardRow first>
              <View className='flex-row items-center justify-between gap-x-[12px]'>
                <View className='flex-1'>
                  <ThemedText size='subheading' className='font-semibold'>
                    {saved.source === 'uploaded' ? 'Uploaded prescription' : 'Issued prescription'}
                  </ThemedText>
                  <ThemedText size='small' className='mt-[4px]' style={{ color: Colors.mutedTextColor }}>
                    Saving again replaces this document.
                  </ThemedText>
                </View>
                {saved.document_url ? (
                  <Pressable
                    onPress={() => Linking.openURL(saved.document_url)}
                    className='flex-row items-center gap-x-[6px]'
                  >
                    <ThemedText size='small' className='text-primary font-semibold'>View</ThemedText>
                    <Feather name='external-link' size={15} color={Colors.primary} />
                  </Pressable>
                ) : null}
              </View>
            </CardRow>
          </Card>
        ) : null}

        <Card>
          <CardSection
            icon={<Feather name='activity' size={15} color={Colors.primaryTextColor} />}
            title='Vitals'
          />
          <CardRow first>
            <View className='flex-row gap-x-[12px]'>
              <Field label='BP' value={form.bp} onChange={set('bp')} placeholder='120/80' />
              <Field label='Pulse' value={form.pulse} onChange={set('pulse')} placeholder='72' />
            </View>
            <View className='flex-row gap-x-[12px] mt-[12px]'>
              <Field label='Weight' value={form.weight} onChange={set('weight')} placeholder='68 kg' />
              <Field label='Height' value={form.height} onChange={set('height')} placeholder='172 cm' />
            </View>
          </CardRow>
        </Card>

        <Card>
          <CardSection
            icon={<Feather name='file-text' size={15} color={Colors.primaryTextColor} />}
            title='Consultation'
          />
          <CardRow first>
            <Field label='Complaints' value={form.complaints} onChange={set('complaints')} multiline />
          </CardRow>
          <CardRow>
            <Field label='Allergy / History' value={form.allergies} onChange={set('allergies')} multiline />
          </CardRow>
          <CardRow>
            <Field label='Diagnosis' value={form.diagnosis} onChange={set('diagnosis')} multiline />
          </CardRow>
          <CardRow>
            <Field label='Advice' value={form.advice} onChange={set('advice')} multiline />
          </CardRow>
        </Card>

        <Card>
          <CardSection
            icon={<Feather name='clipboard' size={15} color={Colors.primaryTextColor} />}
            title='Medications'
          />
          {form.medications.map((row, index) => (
            <CardRow key={`medication-${index}`} first={index === 0}>
              <View className='flex-row items-center justify-between'>
                <ThemedText size='small' className='font-semibold'>{`Medicine ${index + 1}`}</ThemedText>
                <Pressable onPress={() => removeMedication(index)} hitSlop={8}>
                  <Feather name='trash-2' size={16} color={Colors.danger} />
                </Pressable>
              </View>
              <View className='flex-row gap-x-[12px] mt-[10px]'>
                <Field label='Type' value={row.type} onChange={setMedication(index, 'type')} placeholder='Tab' />
                <Field label='Dose' value={row.dose} onChange={setMedication(index, 'dose')} placeholder='1-0-1' />
              </View>
              <View className='mt-[12px]'>
                <Field
                  label='Drug name & composition'
                  value={row.drug}
                  onChange={setMedication(index, 'drug')}
                  placeholder='Paracetamol 500mg'
                />
              </View>
              <View className='mt-[12px]'>
                <Field
                  label='Duration'
                  value={row.duration}
                  onChange={setMedication(index, 'duration')}
                  placeholder='5 days'
                />
              </View>
            </CardRow>
          ))}
          <CardRow>
            <Pressable onPress={addMedication} className='flex-row items-center gap-x-[8px]'>
              <Feather name='plus' size={16} color={Colors.primary} />
              <ThemedText size='standard' className='text-primary font-semibold'>Add medicine</ThemedText>
            </Pressable>
          </CardRow>
        </Card>

        <Card>
          <CardRow first>
            <Field
              label='Special instructions'
              value={form.instructions}
              onChange={set('instructions')}
              multiline
            />
          </CardRow>
          <CardRow>
            <Field
              label='Follow up'
              value={form.follow_up}
              onChange={set('follow_up')}
              placeholder='After 1 week'
            />
          </CardRow>
        </Card>

        <Pressable
          onPress={attach}
          disabled={isUploading}
          className='flex-row items-center justify-center gap-x-[8px] bg-white rounded-[10px] h-[48px]'
          style={{ borderWidth: 1, borderColor: Colors.cardBorder }}
        >
          {isUploading
            ? <ActivityIndicator size='small' color={Colors.primary} />
            : <Feather name='upload' size={16} color={Colors.primary} />}
          <ThemedText size='standard' className='text-primary font-semibold'>
            Upload a written prescription instead
          </ThemedText>
        </Pressable>
      </ScrollView>

      <StickyFooter bottomInset={bottom}>
        <View className='flex-1'>
          <ActionButton
            title={saved ? 'Update prescription' : 'Issue prescription'}
            tone='primary'
            loading={saving}
            onPress={save}
          />
        </View>
      </StickyFooter>
    </KeyboardAvoidingView>
  )
}

const Field = ({ label, value, onChange, placeholder, multiline = false }: {
  label: string
  value: string
  onChange: (text: string) => void
  placeholder?: string
  multiline?: boolean
}) => (
  <View className='flex-1'>
    <ThemedText size='small' style={{ color: Colors.mutedTextColor }}>{label}</ThemedText>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor='#9A9A9A'
      multiline={multiline}
      className='rounded-[8px] px-[12px] mt-[6px]'
      style={{
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        minHeight: multiline ? 76 : 44,
        paddingTop: multiline ? 10 : 0,
        textAlignVertical: multiline ? 'top' : 'center',
        color: Colors.primaryTextColor,
      }}
    />
  </View>
)

export default PrescriptionScreen
